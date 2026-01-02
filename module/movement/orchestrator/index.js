// module/movement/index.js
// Public interface for the entire movement subsystem.

export { runMovementPhase } from "./orchestrator/index.js";
export { runMovementEngine } from "./movement-engine.js";
export { applyHazards } from "./hazard-engine.js";
export { runControlRoll } from "./control-engine.js";
export { resolveCollision } from "./collision-engine.js";
export { runCrashTable } from "./crash-router.js";
export { runMovementPhaseForUI } from "./movement-phase-ui-adapter.js";