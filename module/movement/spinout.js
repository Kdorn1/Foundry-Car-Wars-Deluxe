// module/movement/spinout.js
// ------------------------------------------------------------
// Car Wars Deluxe — Spinout Physics (Phase 2)
// Pure logic only — no dice rolls, no token updates,
// no templates, no chat messages.
// ------------------------------------------------------------

/**
 * Resolve a spinout result.
 *
 * RAW Summary:
 * - Vehicle rotates randomly: 1d6 × 60°
 * - Vehicle ends facing the rolled direction
 * - Vehicle usually drops to 0 speed
 * - Vehicle is considered out of control for the remainder of the phase
 *
 * Phase 2 rules:
 * - Do NOT roll dice here.
 * - Do NOT rotate tokens.
 * - Do NOT create templates.
 * - Do NOT update actor state.
 * - Return structured data only.
 *
 * @param {Actor} actor
 * @param {number} severity  // Crash Table 2 severity or equivalent
 * @returns {object} Structured spinout outcome
 */
export function resolveSpinout(actor, severity = 1) {

  // RAW: rotation is 1d6 × 60°
  const rotationFormula = "1d6 × 60°";

  // RAW: speed becomes 0 after spinout
  const temporarySpeed = 0;

  return {
    type: "spinout",
    severity,

    // Phase 2: return formula, not rolled value
    rotationFormula,

    // UI will compute final facing after rolling
    finalFacing: null,

    // RAW: speed drops to 0
    temporarySpeed,

    // Flags for movement-state
    isSpinout: true,
    isSkidding: false
  };
}
