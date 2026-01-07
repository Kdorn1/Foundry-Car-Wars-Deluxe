// module/movement/orchestrator/movement-orchestrator.js
// Function: Top-level orchestrator that runs a full movement phase using pure logic modules.

import { runManeuverFlow } from "./maneuver-flow.js";
import { runHazardFlow } from "./hazard-flow.js";
import { runControlFlow } from "./control-flow.js";
import { runCollisionFlow } from "./collision-flow.js";
import { runCrashFlow } from "./crash-flow.js";

export async function runMovementPhase(actor, maneuverId) {
  const result = {
    maneuver: null,
    movement: null,
    hazards: null,
    control: null,
    collisions: [],
    crash: null,
    finalState: null
  };

  // Step 1: Maneuver selection + base movement
  const maneuverResult = runManeuverFlow(actor, maneuverId);
  result.maneuver = maneuverResult.maneuver;
  result.movement = maneuverResult.movementState;

  // Step 2: Apply hazards + HC adjustments
  const hazardResult = runHazardFlow(actor, result.movement);
  result.hazards = hazardResult;

  // Step 3: Determine if a control roll is required
  const controlResult = runControlFlow(actor, result.movement, result.hazards);
  result.control = controlResult;

  // Step 4: Collision detection + resolution
  const collisionResult = runCollisionFlow(actor, result.movement);
  result.collisions = collisionResult.collisions;

  // Step 5: Crash table (skids, rolls, fishtails, vaults)
  const crashResult = runCrashFlow(actor, result.movement, collisionResult);
  result.crash = crashResult;

  // Final state after all adjustments
  result.finalState = {
    speed: result.movement.speed,
    facing: result.movement.facing,
    hc: result.hazards.newHC,
    position: result.movement.position
  };

  return result;
}
