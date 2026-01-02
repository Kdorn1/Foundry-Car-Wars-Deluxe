// module/movement/conforming.js
// ------------------------------------------------------------
// Car Wars Deluxe — Conforming Movement (Phase 2)
// ------------------------------------------------------------

const FLAG_SCOPE = "carwars";
const FLAG_KEY = "conforming";

/**
 * Mark secondaryToken as conforming to primaryToken.
 */
export async function recordConformingPair(primaryToken, secondaryToken, data = {}) {
  if (!primaryToken || !secondaryToken) return;

  const updated = {
    primaryId: primaryToken.id,
    type: data.type ?? "unknown",
    startedAtRound: game.round ?? 0,
    sceneId: primaryToken.parent?.id ?? null
  };

  await secondaryToken.setFlag(FLAG_SCOPE, FLAG_KEY, updated);

  // Phase 2: update movement state
  await secondaryToken.actor?.update({
    "system.movement.isConforming": true
  });
}

/**
 * Remove conforming state from a token.
 */
export async function clearConformingForToken(token) {
  if (!token) return;

  await token.unsetFlag(FLAG_SCOPE, FLAG_KEY);

  // Phase 2: update movement state
  await token.actor?.update({
    "system.movement.isConforming": false
  });
}

/**
 * Check if tokenB is conforming to tokenA.
 */
export function isConformingPair(primaryToken, secondaryToken) {
  if (!primaryToken || !secondaryToken) return false;
  const flag = secondaryToken.getFlag(FLAG_SCOPE, FLAG_KEY);
  return flag?.primaryId === primaryToken.id;
}

/**
 * Prevent collision resolution if tokens are conforming.
 */
export function shouldSkipCollisionDueToConforming(tokenA, tokenB) {
  return (
    isConformingPair(tokenA, tokenB) ||
    isConformingPair(tokenB, tokenA)
  );
}

/**
 * Slide secondary along primary's facing direction.
 * (Token movement is allowed here — RAW conforming behavior.)
 */
export async function slideAlongPrimary(primaryToken, secondaryToken, { gridSteps = 1 } = {}) {
  if (!primaryToken || !secondaryToken) return;

  const scene = primaryToken.parent;
  const grid = scene.grid.size;
  const angle = (primaryToken.rotation * Math.PI) / 180;

  const dx = Math.round(Math.cos(angle)) * gridSteps * grid;
  const dy = Math.round(Math.sin(angle)) * gridSteps * grid;

  await secondaryToken.update({
    x: secondaryToken.x + dx,
    y: secondaryToken.y + dy
  });
}

/**
 * Phase 2: pivotToClear is disabled.
 * Token rotation is not allowed in logic modules.
 */
export async function pivotToClear(primaryToken, secondaryToken, opts = {}) {
  console.warn("[carwars] pivotToClear() disabled in Phase 2 (no token rotation).");
}

/**
 * End conforming if tokens are no longer touching.
 */
export async function updateConformingState(primaryToken, secondaryToken) {
  if (!primaryToken || !secondaryToken) return;

  const touching = tokensAreTouching(primaryToken, secondaryToken);

  if (!touching) {
    await clearConformingForToken(secondaryToken);
  }
}

/**
 * Bounding-box overlap check.
 */
export function tokensAreTouching(tokenA, tokenB) {
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
