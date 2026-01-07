// module/movement/orchestrator/hazard-flow.js
// Function: Applies the hazard engine and computes HC changes after the maneuver.

import { applyHazards } from '../movement-api.js';

export function runHazardFlow(actor, movementState) {
  // Hazard engine returns: { hazardsApplied, newHC, totalHazard }
  const hazardResult = applyHazards(actor, movementState);

  return {
    hazardsApplied: hazardResult.hazardsApplied,
    totalHazard: hazardResult.totalHazard,
    newHC: hazardResult.newHC
  };
}
