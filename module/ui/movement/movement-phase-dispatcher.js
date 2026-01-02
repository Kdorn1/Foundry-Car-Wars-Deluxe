// module/ui/movement/movement-phase-dispatcher.js
// Routes the movement phase result to the appropriate UI modules.

import { renderHazardCard } from "../chat/hazard-card.js";
import { renderControlRollCard } from "../chat/control-roll-card.js";
import { renderCrashCard } from "../chat/crash-card.js";
import { updateMovementPanel } from "./movement-panel-updater.js";

export function handleMovementPhaseResult(result) {
  if (result.hazards && result.hazards.length > 0) {
    renderHazardCard(result.hazards);
  }

  if (result.control && result.control.required) {
    renderControlRollCard(result.control);
  }

  if (result.crash) {
    renderCrashCard(result.crash);
  }

  updateMovementPanel(result.finalState);
}
