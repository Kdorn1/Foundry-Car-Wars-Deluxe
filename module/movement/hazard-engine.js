// module/movement/hazard-engine.js
// ------------------------------------------------------------
// Car Wars Deluxe — Hazard Engine (Phase 2)
// Pure logic only. Computes hazard accumulation and HC changes.
// ------------------------------------------------------------

/**
 * Compute hazard accumulation and resulting HC change.
 *
 * @param {object} opts
 * @param {number} opts.currentHC - current handling status (–6 to +3)
 * @param {number} [opts.maneuverHazard=0] - hazard from maneuver difficulty
 * @param {number} [opts.collisionHazard=0] - hazard from collision
 * @param {number} [opts.skidHazard=0] - hazard from skid/spinout
 * @param {number} [opts.otherHazard=0] - terrain, obstacles, etc.
 *
 * @returns {object} {
 *   totalHazard,
 *   newHC,
 *   deltaHC
 * }
 */
export function computeHazard({
  currentHC,
  maneuverHazard = 0,
  collisionHazard = 0,
  skidHazard = 0,
  otherHazard = 0
}) {
  const totalHazard =
    maneuverHazard +
    collisionHazard +
    skidHazard +
    otherHazard;

  const newHC = currentHC - totalHazard;

  return {
    totalHazard,
    newHC,
    deltaHC: newHC - currentHC
  };
}

/**
 * Combine multiple hazard sources into a single number.
 */
export function sumHazards(...values) {
  return values.reduce((a, b) => a + (b ?? 0), 0);
}

/**
 * Phase 2 wrapper expected by orchestrators.
 * Applies hazard logic and returns a structured result.
 */
export function applyHazards(actor, movementState) {
  const currentHC = movementState.handlingStatus ?? 0;

  const maneuverHazard = movementState.lastHazard ?? 0;
  const collisionHazard = movementState.collisionHazard ?? 0;
  const skidHazard = movementState.skidHazard ?? 0;
  const otherHazard = movementState.otherHazard ?? 0;

  const result = computeHazard({
    currentHC,
    maneuverHazard,
    collisionHazard,
    skidHazard,
    otherHazard
  });

  return {
    hazardsApplied: {
      maneuverHazard,
      collisionHazard,
      skidHazard,
      otherHazard
    },
    totalHazard: result.totalHazard,
    newHC: result.newHC
  };
}
