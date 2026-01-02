// module/ui/movement/control-roll-result-handler.js
// Handles the dice result from a control roll and routes crash outcomes.

import { runCrashTable } from "../../../movement/index.js";
import { renderCrashCard } from "../chat/crash-card.js";
import { updateMovementPanel } from "./movement-panel-updater.js";

export async function handleControlRollResult(actor, control, rollTotal) {
  const success = rollTotal >= control.target;

  if (success) {
    // No crash — update HC and movement state
    updateMovementPanel(control.finalState);
    return { success: true };
  }

  // Failed control roll → run crash table
  const crashResult = await runCrashTable(actor, control);

  // Render crash card
  renderCrashCard(crashResult);

  // Update movement panel with crash outcome
  updateMovementPanel(crashResult.finalState);

  return {
    success: false,
    crash: crashResult
  };
}
