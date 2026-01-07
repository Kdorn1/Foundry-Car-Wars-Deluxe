// module/movement/movement-phase-ui-adapter.js
// Phase 5 UI Adapter — bridges UI → Orchestrator

import { runMovementPhase } from "./orchestrator/index.js";

/**
 * UI-friendly wrapper for running a movement phase.
 * The UI layer calls this instead of calling the orchestrator directly.
 *
 * @param {Actor} actor - The vehicle actor performing the movement.
 * @param {Object} movementState - Optional movement state overrides from the UI.
 * @returns {Promise<Object>} - The full movement phase result for the dispatcher.
 */
export async function runMovementPhaseForUI(actor, movementState = {}) {
  if (!actor) {
    console.error("runMovementPhaseForUI called without an actor");
    return { error: "No actor provided" };
  }

  // Pull the actor's current movement state from system data
  const baseState = actor.system?.movement ?? {};

  // Merge UI overrides (maneuver selection, speed changes, etc.)
  const state = {
    ...baseState,
    ...movementState,
    actorId: actor.id
  };

  // Call the orchestrator (Phase 3 core logic)
  const result = await runMovementPhase(actor, state);

  // Return the orchestrator result directly to the UI dispatcher
  return result;
}
