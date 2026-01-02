// module/movement/orchestrator/movement-phase-schema.js
// Function: Defines a static schema for validating movement-phase results.

export const MovementPhaseSchema = {
  type: "object",
  required: [
    "maneuver",
    "movement",
    "hazards",
    "control",
    "collisions",
    "crash",
    "finalState"
  ],
  properties: {
    maneuver: { type: ["object", "null"] },
    movement: { type: ["object", "null"] },
    hazards: { type: ["object", "null"] },
    control: { type: ["object", "null"] },
    collisions: {
      type: "array",
      items: { type: "object" }
    },
    crash: { type: ["object", "null"] },
    finalState: {
      type: "object",
      required: ["speed", "facing", "hc", "position"],
      properties: {
        speed: { type: ["number", "null"] },
        facing: { type: ["number", "null"] },
        hc: { type: ["number", "null"] },
        position: { type: ["object", "null"] }
      }
    }
  }
};
