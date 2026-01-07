// module/movement/orchestrator/crash-flow.js
// Function: Runs Crash Table logic (skids, rolls, fishtails, vaults) after collisions and hazards.

import { runCrashTable } from "../../movement/crash-router.js";

export function runCrashFlow(actor, movementState, collisionResult) {
  // crash-router returns: { type, details, newFacing, newSpeed, position }
  const crash = runCrashTable(actor, movementState, collisionResult);

  return {
    type: crash.type,
    details: crash.details,
    newFacing: crash.newFacing,
    newSpeed: crash.newSpeed,
    position: crash.position
  };
}
