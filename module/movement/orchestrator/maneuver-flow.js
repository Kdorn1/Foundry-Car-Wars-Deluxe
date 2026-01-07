// module/movement/orchestrator/maneuver-flow.js
// Function: Looks up the maneuver and produces the initial movement state.

import { getManeuverById } from '../movement-api.js';
import { performManeuver } from '../movement-api.js';

export async function runManeuverFlow(actor, maneuverId) {
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

  const speed = actor.system.movement?.lastSpeed ?? 0;

  const movementState = await performManeuver(actor, maneuverId, speed);

  return {
    maneuver,
    movementState
  };
}

