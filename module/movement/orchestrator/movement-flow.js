// module/movement/orchestrator/movement-flow.js
// Function: Wraps the movement engine for orchestrator use.

import { runMovementEngine } from "../../movement/movement-engine.js";

export function runMovementFlow(actor, movementState) {
  // Movement engine returns: { path, distance, newState, notes }
  const movementResult = runMovementEngine(actor, movementState);

  return {
    path: movementResult.path,
    distance: movementResult.distance,
    newState: movementResult.newState,
    notes: movementResult.notes || null
  };
}
