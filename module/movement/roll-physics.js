// module/movement/roll-physics.js
// ------------------------------------------------------------
// Car Wars Deluxe — Roll Physics Engine (Phase 2)
// Pure logic only — no actor updates, no token movement,
// no chat messages, no dice rolls.
// ------------------------------------------------------------

/**
 * Resolve a "rolling" crash result from Crash Table 1.
 *
 * Phase 2 rules:
 * - No dice are rolled here.
 * - No actor or token updates occur here.
 * - No chat messages are created here.
 * - This module returns a structured outcome object.
 *
 * @param {Actor} actor    The vehicle actor
 * @param {number} severity Crash Table 1 severity (5–9)
 * @returns {object}       Structured roll outcome
 */
export async function resolveRoll(actor, severity) {
  const speed = actor.system.speed || 0;

  // ------------------------------------------------------------
  // Determine roll violence based on severity
  // ------------------------------------------------------------
  let steps;         // how many facings get hit
  let dmgFormula;    // base damage per step

  if (severity <= 5) {
    steps = 2;       // mild roll
    dmgFormula = "1d6";
  } else if (severity <= 7) {
    steps = 4;       // full roll
    dmgFormula = "2d6";
  } else {
    steps = 6;       // very violent roll
    dmgFormula = "3d6";
  }

  // ------------------------------------------------------------
  // Facing sequence for a roll
  // ------------------------------------------------------------
  const facingSequence = [
    "side",
    "top",
    "side",
    "bottom",
    "top",
    "bottom"
  ];

  const appliedFacings = facingSequence.slice(0, steps);

  // ------------------------------------------------------------
  // Deceleration (RAW abstraction)
  // ------------------------------------------------------------
  const decel = 20; // mph per roll band
  const speedAfter = Math.max(0, speed - decel);

  // ------------------------------------------------------------
  // Rotation (visual cue only — Phase 4 will animate)
  // ------------------------------------------------------------
  const stepsPerQuarterTurn = 2;
  const quarterTurns = Math.floor(steps / stepsPerQuarterTurn);
  const deltaRotation = quarterTurns * 90; // degrees

  // ------------------------------------------------------------
  // Burning check (RAW: severity 6+)
  // Phase 2: return the *need* for a burning check, not the result.
  // ------------------------------------------------------------
  const requiresBurnCheck = severity >= 6;

  // ------------------------------------------------------------
  // Return structured outcome (Phase 2 standard)
  // ------------------------------------------------------------
  return {
    type: "roll",
    severity,
    steps,
    dmgFormula,
    appliedFacings,     // array of facings hit in order
    speedBefore: speed,
    speedAfter,
    deltaRotation,      // degrees to rotate token (Phase 4)
    requiresBurnCheck,  // Phase 4 UI will prompt the player
    damageLog: []       // Phase 4 will fill this after dice rolls
  };
}
