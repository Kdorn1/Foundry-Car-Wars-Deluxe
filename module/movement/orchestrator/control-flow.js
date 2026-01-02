// module/movement/orchestrator/control-flow.js
// Function: Determines if a control roll is required and prepares the roll request object.

import { computeControlRoll } from "../../movement/control-table.js";

export function runControlFlow(actor, movementState, hazardState) {
  const control = computeControlRoll(actor, movementState, hazardState);

  return {
    required: control.required,
    target: control.target,
    modifier: control.modifier,
    difficulty: control.difficulty,
    reason: control.reason
  };
}
