// module/movement/crash-table-2.js
// ------------------------------------------------------------
// Car Wars Deluxe — Crash Table 2 Resolver (Phase 2)
// Handles fishtails (minor, major, and escalations to Crash Table 1).
// Uses margin of failure from the control roll.
// ------------------------------------------------------------

import { resolveFishtail } from "./fishtail-physics.js";
import { resolveCrashTable1 } from "./crash-table-1.js";

/**
 * Resolve Crash Table 2 result.
 * @param {Actor} actor
 * @param {object} controlResult - from control-rolls.js
 * @returns {object} crashOutcome
 */
export async function resolveCrashTable2(actor, controlResult) {
  const margin = controlResult.margin ?? 0;

  ChatMessage.create({
    speaker: { alias: actor.name },
    content: `🔁 <b>Crash Table 2:</b> Resolving fishtail (margin <b>${margin}</b>).`
  });

  // ------------------------------------------------------------
  // Delegate to fishtail physics engine
  // ------------------------------------------------------------
  const outcome = await resolveFishtail(actor, margin);

  // Expected outcome shape:
  // {
  //   fishtailType: "minor" | "major",
  //   direction: degrees,
  //   squares: number,
  //   temporarySpeed: number | undefined,
  //   triggersCrashTable1: boolean
  // }

  // ------------------------------------------------------------
  // If fishtail escalates to Crash Table 1, resolve that too
  // ------------------------------------------------------------
  let escalation = null;

  if (outcome.triggersCrashTable1) {
    ChatMessage.create({
      speaker: { alias: actor.name },
      content: `⚠️ <b>Fishtail Escalation:</b> Routing to Crash Table 1...`
    });

    escalation = await resolveCrashTable1(actor, controlResult);
  }

  // ------------------------------------------------------------
  // Build structured crash outcome
  // ------------------------------------------------------------
  const crashOutcome = {
    type: "fishtail",
    table: 2,
    margin,
    ...outcome,
    escalation
  };

  // ------------------------------------------------------------
  // Apply movement state updates
  // ------------------------------------------------------------
  const updates = {};

  // Fishtails always cause a directional change
  if (outcome.direction !== undefined) {
    const token = actor.getActiveTokens()[0];
    if (token) {
      await token.document.update({ rotation: outcome.direction });
    }
  }

  // Major fishtails often cause speed loss (handled in fishtail-physics)
  if (outcome.temporarySpeed !== undefined) {
    updates["system.movement.temporarySpeed"] = outcome.temporarySpeed;
  }

  // Crash Table 1 escalation handles skid/spinout state
  if (Object.keys(updates).length > 0) {
    await actor.update(updates);
  }

  return crashOutcome;
}

// ------------------------------------------------------------
// Additional exports required by importers
// ------------------------------------------------------------
export { resolveFishtail, resolveCrashTable1 };
