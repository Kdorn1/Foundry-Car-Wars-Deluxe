// module/movement/index.js
// Public interface for the entire movement subsystem.

// Phase 3 Orchestrator
export { runMovementPhase } from "./orchestrator/index.js";

// Movement Engine (core movement logic)
export { runMovementEngine } from "./movement-engine.js";

// Hazard Engine (hazard application + HC changes)
export { applyHazards } from "./hazard-engine.js";

// Control Roll Engine (control table + modifiers)
export { runControlRoll } from "./control-engine.js";

// Collision Engine (collision resolution + damage routing)
export { resolveCollision } from "./collision-engine.js";

// Crash Router (skids, rolls, fishtails, vaults)
export { runCrashTable } from "./crash-router.js";
