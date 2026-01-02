// module/movement/skid-physics.js
// ------------------------------------------------------------
// Car Wars Deluxe — Skid Physics Engine (Phase 2)
// Pure logic only — no actor updates, no token movement,
// no chat messages, no drawings, no templates.
// ------------------------------------------------------------

/**
 * Resolve a skid result from Crash Table 1.
 * severity = 1, 2, 3, or 4
 *
 * Returns a structured outcome object consumed by crash-router.js
 * and later by Phase 4 UI modules.
 */
export async function resolveSkid(actor, severity) {
  // ------------------------------------------------------------
  // RAW Skid Distances (in inches)
  // ------------------------------------------------------------
  let distanceInches = 0;

  switch (severity) {
    case 1: distanceInches = 0.25; break;
    case 2: distanceInches = 0.5; break;
    case 3: distanceInches = 0.75; break;
    case 4: distanceInches = 1.0; break;
  }

  // ------------------------------------------------------------
  // Determine skid direction (vehicle's facing before loss of control)
  // ------------------------------------------------------------
  const directionDegrees = getPreLossDirection(actor);

  // ------------------------------------------------------------
  // Compute offset vector (in inches)
  // ------------------------------------------------------------
  const skidData = computeSkidOffset(directionDegrees, distanceInches);

  // ------------------------------------------------------------
  // Tire damage (RAW: severity 4 → 2 damage per tire)
  // Phase 2: return as data, do NOT apply it.
  // ------------------------------------------------------------
  const tireDamage = severity === 4 ? 2 : 0;

  // ------------------------------------------------------------
  // Return structured outcome (Phase 2 standard)
  // ------------------------------------------------------------
  return {
    type: "skid",
    severity,
    distanceInches,
    directionDegrees,
    skidData,       // { dx, dy } in inches
    tireDamage,     // number per tire
    finalFacing: directionDegrees, // RAW: skids do not change facing
    temporarySpeed: null           // placeholder for future rules
  };
}

/**
 * Determine the direction the vehicle was moving BEFORE losing control.
 * Uses token rotation.
 */
function getPreLossDirection(actor) {
  const token = actor.getActiveTokens()[0];
  return token ? token.rotation : 0;
}

/**
 * Convert direction + distance into offset (in inches).
 */
function computeSkidOffset(direction, distanceInches) {
  const radians = (direction * Math.PI) / 180;
  return {
    dx: Math.cos(radians) * distanceInches,
    dy: Math.sin(radians) * distanceInches
  };
}
