// module/ui/movement/movement-panel-updater.js
// Applies final movement state to the actor sheet.

export function updateMovementPanel(finalState) {
  if (!finalState) return;

  const actor = game.actors.get(finalState.actorId);
  if (!actor) return;

  const updates = {};

  // Speed
  if (finalState.speed !== undefined) {
    updates["system.movement.currentSpeed"] = finalState.speed;
  }

  // Facing (Hybrid Facing Requirement)
  if (finalState.facing !== undefined) {
    updates["system.movement.facing"] = finalState.facing;

    // Sync token rotation
    for (const token of actor.getActiveTokens()) {
      token.document.update({ rotation: finalState.facing });
    }
  }

  // Handling Class
  if (finalState.hc !== undefined) {
    updates["system.movement.currentHC"] = finalState.hc;
  }

  // Hazards
  if (finalState.hazards !== undefined) {
    updates["system.movement.hazards"] = finalState.hazards;
  }

  // Phase
  if (finalState.phase !== undefined) {
    updates["system.movement.phase"] = finalState.phase;
  }

  // Skid / Spinout flags
  if (finalState.isSkidding !== undefined) {
    updates["system.movement.isSkidding"] = finalState.isSkidding;
  }
  if (finalState.isSpinout !== undefined) {
    updates["system.movement.isSpinout"] = finalState.isSpinout;
  }

  actor.update(updates);
}
