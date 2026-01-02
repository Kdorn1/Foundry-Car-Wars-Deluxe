// module/ui/movement/movement-phase-service.js
// Entry point: runs a full movement phase from UI input.

import { runMovementPhaseForUI } from "../../../movement/index.js";

export async function executeMovementPhase(actor, maneuver) {
  const movementState = {
    maneuver,
    speed: actor.system.speed,
    facing: actor.system.facing,
    hc: actor.system.hc,
    position: actor.system.position
  };

  const result = await runMovementPhaseForUI(actor, movementState);
  return result;
}
