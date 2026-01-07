// module/movement/orchestrator/movement-flow.js
// Function: Wraps the movement engine for orchestrator use.

import { runMovementEngine } from '../movement-api.js';

/**
 * Phase‑3 orchestrator wrapper for movement engine.
 * Pure delegation. No state mutation. No UI. No dice.
 */
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

/**
 * Phase‑3 orchestrator entry point expected by UI and dispatcher.
 * This is the missing export flagged by the audit:
 *   executeMovementPhase → used in maneuver-handler.js
 *
 * It simply delegates to runMovementFlow.
 */
export function executeMovementPhase(actor, movementState) {
  return runMovementFlow(actor, movementState);
}
