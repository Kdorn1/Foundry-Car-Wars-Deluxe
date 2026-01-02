// module/movement/orchestrator/maneuver-flow.js
// Function: Looks up the maneuver and produces the initial movement state.

import { getManeuverById } from "../../movement/maneuver-registry.js";
import { performManeuver } from "../../movement/perform-maneuver.js";

export function runManeuverFlow(actor, maneuverId) {
  const maneuver = getManeuverById(maneuverId);
  if (!maneuver) {
    return {
      maneuver: null,
      movementState: {
        speed: actor.system.speed,
        facing: actor.system.facing,
        position: actor.system.position
      }
    };
  }

  const movementState = performManeuver(actor, maneuver);

  return {
    maneuver,
    movementState
  };
}
