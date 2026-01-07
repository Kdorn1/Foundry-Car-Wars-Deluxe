// module/movement/orchestrator/movement-phase-validator.js
// Function: Validates a movement-phase result object against the schema.

import { MovementPhaseSchema } from "./movement-phase-schema.js";

export function validateMovementPhaseResult(result) {
  const errors = [];

  // Helper: check type
  function checkType(path, value, expected) {
    const types = Array.isArray(expected) ? expected : [expected];
    const actual = value === null ? "null" : typeof value;
    if (!types.includes(actual)) {
      errors.push(`${path} expected type ${types.join(" or ")}, got ${actual}`);
    }
  }

  // Validate top-level required fields
  for (const field of MovementPhaseSchema.required) {
    if (!(field in result)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate collisions array
  if (Array.isArray(result.collisions) === false) {
    errors.push("collisions must be an array");
  }

  // Validate finalState
  if (typeof result.finalState !== "object" || result.finalState === null) {
    errors.push("finalState must be an object");
  } else {
    const fs = result.finalState;
    const requiredFS = MovementPhaseSchema.properties.finalState.required;

    for (const field of requiredFS) {
      if (!(field in fs)) {
        errors.push(`finalState missing required field: ${field}`);
      }
    }

    checkType("finalState.speed", fs.speed, ["number", "null"]);
    checkType("finalState.facing", fs.facing, ["number", "null"]);
    checkType("finalState.hc", fs.hc, ["number", "null"]);
    checkType("finalState.position", fs.position, ["object", "null"]);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
