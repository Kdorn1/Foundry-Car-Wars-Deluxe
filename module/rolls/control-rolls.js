// module/rolls/control-rolls.js
// ------------------------------------------------------------
// Player-facing control roll handler (Phase 2)
// - Reads pending control roll from actor
// - Rolls 2d6
// - Compares to target
// - Routes crash if failed
// - Updates movement state
// ------------------------------------------------------------

import { routeCrash } from "../movement/crash-router.js";
import { updateMovementState } from "../movement/movement-state.js";

Hooks.on("renderChatMessage", (message, html) => {
  const button = html[0]?.querySelector(".control-roll-button");
  if (!button) return;

  button.addEventListener("click", async () => {
    const actorId = button.dataset.actorId;
    const actor = game.actors.get(actorId);
    if (!actor) return;

    // ------------------------------------------------------------
    // Phase 2: Pull pending control roll from actor
    // ------------------------------------------------------------
    const pending = actor.system.movement?.pendingControlRoll;
    if (!pending) {
      ui.notifications.warn("No pending control roll found.");
      return;
    }

    const target = pending.target;
    const crashTable = pending.crashTable;

    // ------------------------------------------------------------
    // Player rolls 2d6
    // ------------------------------------------------------------
    const roll = await new Roll("2d6").roll({ async: true });
    await roll.toMessage({
      speaker: { alias: actor.name },
      flavor: `Control Roll vs Target ${target}`
    });

    const total = roll.total;
    const success = total >= target;

    // ------------------------------------------------------------
    // Success
    // ------------------------------------------------------------
    if (success) {
      ChatMessage.create({
        speaker: { alias: actor.name },
        content: `✅ <b>Control Roll Success!</b> Rolled <b>${total}</b> vs Target <b>${target}</b>.`
      });

      // Update movement state: clear pending roll
      await updateMovementState(actor, {
        pendingControlRoll: null,
        crashOutcome: null
      });

      return;
    }

    // ------------------------------------------------------------
    // Failure → Crash
    // ------------------------------------------------------------
    ChatMessage.create({
      speaker: { alias: actor.name },
      content: `❌ <b>Control Roll Failed!</b> Rolled <b>${total}</b> vs Target <b>${target}</b>.`
    });

    const crashOutcome = await routeCrash(actor, {
      success: false,
      target,
      roll: total,
      margin: target - total,
      crashTable
    });

    // ------------------------------------------------------------
    // Update movement state with crash outcome
    // ------------------------------------------------------------
    await updateMovementState(actor, {
      pendingControlRoll: null,
      crashOutcome
    });
  });
});

// Additional export required by importers
export { routeCrash };
