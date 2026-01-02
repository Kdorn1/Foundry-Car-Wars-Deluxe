// module/ui/movement/maneuver-handler.js
// Handles maneuver selection and triggers movement phase execution.

import { executeMovementPhase } from "./movement-phase-service.js";

export async function onManeuverSelected(actor, maneuverId) {
  const maneuver = game.carwars.maneuvers.get(maneuverId);
  const result = await executeMovementPhase(actor, maneuver);

  return result; // Phase 4 dispatcher will handle routing
}
