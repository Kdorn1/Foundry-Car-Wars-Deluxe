// module/movement/crash-table-1.js
// ------------------------------------------------------------
// Car Wars Deluxe — Crash Table 1 Resolver (Phase 2)
// Handles skids (1–4), rolls (5–9), and vaults (10+).
// Uses margin of failure from the control roll.
// ------------------------------------------------------------

import { resolveSkid } from "./skid-physics.js";
import { resolveRoll } from "./roll-physics.js";
import { resolveVault } from "./vault-physics.js";

/**
 * Resolve Crash Table 1 result.
 * @param {Actor} actor
 * @param {object} controlResult - from control-rolls.js
 * @param {string} maneuverType - optional: used for vault flip logic
 * @returns {object} crashOutcome
 */
export async function resolveCrashTable1(actor, controlResult, maneuverType = "") {
  // RAW: Crash severity is based on margin of failure
  let value = controlResult.margin ?? 0;

  // RAW normalization: 0 and 1 both count as 1
  if (value <= 1) value = 1;

  ChatMessage.create({
    speaker: { alias: actor.name },
    content: `💥 <b>Crash Table 1:</b> Resolving crash (margin <b>${value}</b>).`
  });

  // ------------------------------------------------------------
  // SKID RESULTS (1–4)
  // ------------------------------------------------------------
  if (value >= 1 && value <= 4) {
    const outcome = await resolveSkid(actor, value);

    return {
      type: "skid",
      table: 1,
      margin: value,
      ...outcome
    };
  }

  // ------------------------------------------------------------
  // ROLLING RESULTS (5–9)
  // ------------------------------------------------------------
  if (value >= 5 && value <= 9) {
    const outcome = await resolveRoll(actor, value);

    return {
      type: "roll",
      table: 1,
      margin: value,
      ...outcome
    };
  }

  // ------------------------------------------------------------
  // VAULTING RESULTS (10+)
  // ------------------------------------------------------------
  if (value >= 10) {
    const outcome = await resolveVault(actor, value, maneuverType);

    return {
      type: "vault",
      table: 1,
      margin: value,
      ...outcome
    };
  }

  // ------------------------------------------------------------
  // Fallback (should never happen)
  // ------------------------------------------------------------
  ChatMessage.create({
    speaker: { alias: actor.name },
    content: `⚠️ Crash Table 1: Unexpected margin value <b>${value}</b>.`
  });

  return {
    type: "unknown",
    table: 1,
    margin: value
  };
}

// ------------------------------------------------------------
// Additional exports required by importers
// ------------------------------------------------------------
export { resolveSkid, resolveRoll, resolveVault };
