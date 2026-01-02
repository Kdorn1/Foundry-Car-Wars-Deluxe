// module/movement/vault-physics.js
// ------------------------------------------------------------
// Car Wars Deluxe — Vault Physics Engine (Phase 2)
// Pure logic only — no actor updates, no token movement,
// no chat messages, no dice rolls.
// ------------------------------------------------------------

/**
 * Resolve a vault result (Crash Table 1: 10+)
 *
 * RAW Summary:
 * - Tires doing the vaulting take 3d6 damage
 * - Vehicle flies 1d6" in pre-crash direction
 * - Rotates two facings per inch traveled
 * - Landing side takes collision damage at initial speed
 * - Tight bend / hard swerve → flip end-over-end
 * - All occupants take 1 damage (ignores armor)
 * - After landing, vehicle continues rolling as per 6–9
 *
 * Phase 2 rules:
 * - No dice are rolled here.
 * - No actor or token updates occur here.
 * - No chat messages are created here.
 * - This module returns a structured outcome object.
 *
 * @param {Actor} actor
 * @param {number} severity  Crash Table 1 severity (10+)
 * @param {string} maneuverType  // "tight-bend", "hard-swerve", etc.
 * @returns {object} Structured vault outcome
 */
export async function resolveVault(actor, severity, maneuverType = "") {
  const speed = actor.system.speed || 0;

  // ------------------------------------------------------------
  // 1. Vaulting tire damage (RAW: 3d6)
  // Phase 2: return formula, do NOT roll or apply.
  // ------------------------------------------------------------
  const tireDamageFormula = "3d6";

  // ------------------------------------------------------------
  // 2. Vault distance (RAW: 1d6 inches)
  // ------------------------------------------------------------
  const vaultDistanceFormula = "1d6";

  // ------------------------------------------------------------
  // 3. Airborne rotation (two facings per inch)
  // ------------------------------------------------------------
  // Phase 2: compute formula, not actual rotation.
  const facingsPerInch = 2;
  const degreesPerFacing = 90;

  // UI will compute actual rotation after rolling vaultDistance.
  const rotationFormula = `${facingsPerInch} facings per inch × ${degreesPerFacing}°`;

  // ------------------------------------------------------------
  // 4. End-over-end flip for tight bend / hard swerve
  // ------------------------------------------------------------
  const flipEndOverEnd = ["tight-bend", "hard-swerve"].includes(maneuverType);

  // ------------------------------------------------------------
  // 5. Landing collision damage (RAW: 1d6, speed-based)
  // ------------------------------------------------------------
  const landingDamageFormula = "1d6";
  const landingFacing = flipEndOverEnd ? "front" : "side";

  // ------------------------------------------------------------
  // 6. Occupants take 1 damage (ignores armor)
  // ------------------------------------------------------------
  const occupantDamage = 1;

  // ------------------------------------------------------------
  // 7. After landing, vehicle continues rolling as per 6–9
  // Phase 2: do NOT call resolveRoll() here.
  // Crash router will handle follow-up roll.
  // ------------------------------------------------------------
  const followUpRollSeverity = 6;

  // ------------------------------------------------------------
  // Return structured outcome (Phase 2 standard)
  // ------------------------------------------------------------
  return {
    type: "vault",
    severity,
    speedBefore: speed,

    // Tire damage
    tireDamageFormula,

    // Vault travel
    vaultDistanceFormula,

    // Airborne rotation
    rotationFormula,
    facingsPerInch,
    degreesPerFacing,

    // Flip logic
    flipEndOverEnd,

    // Landing collision
    landingFacing,
    landingDamageFormula,

    // Occupant damage
    occupantDamage,

    // Follow-up roll
    followUpRollSeverity
  };
}
