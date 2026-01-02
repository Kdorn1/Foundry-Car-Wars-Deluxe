// module/movement/collision-detection.js
// ------------------------------------------------------------
// Car Wars Deluxe — Collision Detection (Phase 2)
// Pure logic only:
// - Detects bounding-box collisions between tokens
// - Computes impact angle
// - Computes impact point (front, rear, left, right)
// - Computes relative speed vectors
// - Produces a structured collisionEvent object
// ------------------------------------------------------------

/**
 * Check if two tokens overlap (bounding-box collision).
 */
export function tokensOverlap(tokenA, tokenB) {
  const ax1 = tokenA.x;
  const ay1 = tokenA.y;
  const ax2 = tokenA.x + tokenA.width * canvas.grid.size;
  const ay2 = tokenA.y + tokenA.height * canvas.grid.size;

  const bx1 = tokenB.x;
  const by1 = tokenB.y;
  const bx2 = tokenB.x + tokenB.width * canvas.grid.size;
  const by2 = tokenB.y + tokenB.height * canvas.grid.size;

  return (
    ax1 < bx2 &&
    ax2 > bx1 &&
    ay1 < by2 &&
    ay2 > by1
  );
}

/**
 * Compute the angle of impact from A to B.
 * Returns degrees 0–359.
 */
export function computeImpactAngle(tokenA, tokenB) {
  const centerA = {
    x: tokenA.x + (tokenA.width * canvas.grid.size) / 2,
    y: tokenA.y + (tokenA.height * canvas.grid.size) / 2
  };

  const centerB = {
    x: tokenB.x + (tokenB.width * canvas.grid.size) / 2,
    y: tokenB.y + (tokenB.height * canvas.grid.size) / 2
  };

  const dx = centerB.x - centerA.x;
  const dy = centerB.y - centerA.y;

  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (angle + 360) % 360;
}

/**
 * Determine which side of tokenA was hit by tokenB.
 * Returns: "front", "rear", "left", "right"
 */
export function determineImpactPoint(tokenA, impactAngle) {
  const facing = tokenA.rotation % 360;
  const relative = (impactAngle - facing + 360) % 360;

  if (relative >= 315 || relative < 45) return "front";
  if (relative >= 45 && relative < 135) return "right";
  if (relative >= 135 && relative < 225) return "rear";
  return "left";
}

/**
 * Compute relative speed vectors.
 * Phase 2: pure logic, no token movement.
 */
export function computeRelativeSpeeds(actorA, actorB) {
  const mvA = actorA.system.movement ?? {};
  const mvB = actorB.system.movement ?? {};

  return {
    speedA: mvA.lastSpeed ?? 0,
    speedB: mvB.lastSpeed ?? 0
  };
}

/**
 * Build a structured collisionEvent object.
 *
 * @param {Token} tokenA
 * @param {Token} tokenB
 * @returns {object|null} collisionEvent
 */
export function detectCollision(tokenA, tokenB) {
  if (!tokenA || !tokenB) return null;
  if (!tokensOverlap(tokenA, tokenB)) return null;

  const actorA = tokenA.actor;
  const actorB = tokenB.actor;

  if (!actorA || !actorB) return null;

  const angle = computeImpactAngle(tokenA, tokenB);
  const impactPointA = determineImpactPoint(tokenA, angle);
  const impactPointB = determineImpactPoint(tokenB, (angle + 180) % 360);

  const { speedA, speedB } = computeRelativeSpeeds(actorA, actorB);

  return {
    actorA,
    actorB,
    tokenA,
    tokenB,
    angle,
    impactPointA,
    impactPointB,
    speedA,
    speedB,
    massA: actorA.system.weight ?? 1,
    massB: actorB.system.weight ?? 1
  };
}
