// module/ui/movement/movement-phase-service.js

// ------------------------------------------------------------
// IMPORTS
// ------------------------------------------------------------
import { runMovementPhaseForUI } from "../../movement/orchestrator/movement-phase-ui-adapter.js";
import { handleMovementPhaseResult } from "./movement-phase-dispatcher.js";


// ------------------------------------------------------------
// UI SERVICE — CALLED BY ACTOR SHEET
// ------------------------------------------------------------

/**
 * Called when the user selects a maneuver from the dropdown.
 * Stores the selected maneuver ID on the actor.
 */
export async function onManeuverSelected(actor, maneuverId) {
  if (!actor) return;

  await actor.update({
    "system.movement.lastManeuver": maneuverId || ""
  });

  console.log(`🔵 [carwars] Maneuver selected: ${maneuverId}`);
}


/**
 * Called when the user clicks "Execute Movement Phase".
 * Builds UI state → runs orchestrator → dispatches results.
 */
export async function executeMovementPhase(actor) {
  if (!actor) {
    ui.notifications.warn("No actor selected for movement.");
    return;
  }

  console.log("🚗 [carwars] Executing Movement Phase for:", actor.name);

  // Build UI state for orchestrator
  const uiState = {
    speed: actor.system.movement?.lastSpeed ?? 0,
    handlingStatus: actor.system.movement?.handlingStatus ?? 0,
    lastManeuver: actor.system.movement?.lastManeuver ?? null
  };

  console.log("📦 [carwars] UI State:", uiState);

  // Run orchestrator
  const result = await runMovementPhaseForUI(actor, uiState);

  console.log("📤 [carwars] Movement Phase Result:", result);

  // Dispatch results to UI (hazards, control rolls, crash, panel updates)
  await handleMovementPhaseResult(actor, result);
}


// ------------------------------------------------------------
// No adapter export — it does not exist
// ------------------------------------------------------------
