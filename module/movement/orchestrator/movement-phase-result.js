// module/movement/orchestrator/movement-phase-result.js
// Function: Defines the unified result object schema for a full movement phase.

export function createMovementPhaseResult() {
  return {
    maneuver: null,
    movement: null,
    hazards: null,
    control: null,
    collisions: [],
    crash: null,
    finalState: {
      speed: null,
      facing: null,
      hc: null,
      position: null
    }
  };
}
