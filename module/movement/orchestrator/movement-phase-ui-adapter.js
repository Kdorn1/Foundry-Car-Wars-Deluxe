// module/movement/orchestrator/movement-phase-ui-adapter.js
// Adapter: Normalizes orchestrator output for Phase 4 UI.

import { runMovementPhase } from '../movement-api.js';

export async function runMovementPhaseForUI(actor, movementState) {
  const result = await runMovementPhase(actor, movementState);

  return {
    maneuver: result.maneuver,
    movement: result.movement,
    hazards: result.hazards,
    control: result.control,
    collisions: result.collisions,
    crash: result.crash,
    finalState: result.finalState
  };
}
