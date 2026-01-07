// module/movement/orchestrator/movement-phase-orchestrator.js
// Master orchestrator for a full movement phase.

import { runManeuverFlow } from '../movement-api.js';
import { runMovementFlow } from '../movement-api.js';
import { runHazardFlow } from '../movement-api.js';
import { runControlFlow } from '../movement-api.js';
import { runCollisionFlow } from '../movement-api.js';
import { runCrashFlow } from '../movement-api.js';

import { createMovementPhaseResult } from '../movement-api.js';
import { validateMovementPhaseResult } from '../movement-api.js';

export async function runMovementPhase(actor, movementState) {
  const result = createMovementPhaseResult();

  // 1. Maneuver
  result.maneuver = runManeuverFlow(actor, movementState);

  // 2. Movement
  result.movement = runMovementFlow(actor, movementState);

  // 3. Hazards
  result.hazards = runHazardFlow(actor, movementState);

  // 4. Control Roll
  result.control = runControlFlow(actor, movementState, result.hazards);

  // 5. Collisions
  const collisionResult = runCollisionFlow(actor, movementState);
  result.collisions = collisionResult.collisions;

  // 6. Crash Table (if any)
  result.crash = runCrashFlow(actor, movementState, collisionResult);

  // 7. Final State
  result.finalState.speed = movementState.speed;
  result.finalState.facing = movementState.facing;
  result.finalState.hc = movementState.hc;
  result.finalState.position = movementState.position;

  // 8. Validation
  const validation = validateMovementPhaseResult(result);
  if (!validation.valid) {
    console.warn("Movement Phase Result Validation Errors:", validation.errors);
  }

  return result;
} export { runMovementPhase };

