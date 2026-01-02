// module/ui/movement/movement-panel-updater.js
// Applies final movement state to the actor sheet.

export function updateMovementPanel(finalState) {
  if (!finalState) return;

  const actor = game.actors.get(finalState.actorId);
  if (!actor) return;

  const updates = {
    "system.speed": finalState.speed,
    "system.facing": finalState.facing,
    "system.hc": finalState.hc,
    "system.position": finalState.position
  };

  actor.update(updates);
}
