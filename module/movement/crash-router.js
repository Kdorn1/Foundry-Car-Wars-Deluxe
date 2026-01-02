// module/movement/crash-router.js
// ------------------------------------------------------------
// Car Wars Deluxe — Crash Router (Phase 2)
// Pure logic only:
// - Routes to Crash Table 1 or 2
// - Returns structured crash outcome
// - Does NOT update actor state
// - Does NOT rotate tokens
// - Does NOT post chat messages
// ------------------------------------------------------------

import { resolveCrashTable1 } from "./crash-table-1.js";
import { resolveCrashTable2 } from "./crash-table-2.js";

/**
 * Route a failed control roll to the correct crash table.
 *
 * @param {Actor} actor
 * @param {object} controlResult
 * @returns {object} crashOutcome
 */
export async function routeCrash(actor, controlResult) {
  if (!actor) {
    console.error("routeCrash called without actor");
    return { type: "error", message: "No actor provided" };
  }

  const table = controlResult.crashTable ?? 1;
  let crashOutcome;

  switch (table) {
    case 1:
      crashOutcome = await resolveCrashTable1(actor, controlResult);
      break;

    case 2:
      crashOutcome = await resolveCrashTable2(actor, controlResult);
      break;

    default:
      crashOutcome = {
        type: "unknown-table",
        table,
        controlResult
      };
  }

  // Phase 2: DO NOT update actor or token here.
  // Movement state is updated by control-rolls.js via updateMovementState().

  return crashOutcome;
}
