// module/ui/movement/movement-phase-dispatcher.js
// Routes the movement phase result to the appropriate UI modules.

import { renderHazardCard } from "../chat/hazard-card.js";
import { renderControlRollCard } from "../chat/control-roll-card.js";
import { renderCrashCard } from "../chat/crash-card.js";
import { updateMovementPanel } from "./movement-panel-updater.js";

export function handleMovementPhaseResult(result = {}) {
  // Hazards
  if (Array.isArray(result.hazards) && result.hazards.length > 0) {
    renderHazardCard(result.hazards);
  }

  // Control Roll
  if (result.control && result.control.required === true) {
    renderControlRollCard(result.control);
  }

  // Crash
  if (result.crash) {
    renderCrashCard(result.crash);
  }

  // Final movement state (always update panel)
  const finalState = result.finalState ?? {};
  updateMovementPanel(finalState);
}
