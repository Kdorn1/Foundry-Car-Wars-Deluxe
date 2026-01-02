// module/movement/fishtail-physics.js
// ------------------------------------------------------------
// Car Wars Deluxe — Fishtail Physics Engine (Phase 2)
// Handles Crash Table 2 — Fishtails.
// - Uses the control roll's margin (severity)
// - Does NOT roll dice (player-facing only)
// - Does NOT call Crash Table 1 directly
// - Returns a structured outcome for crash-table-2.js
// ------------------------------------------------------------

/**
 * Resolve a Crash Table 2 fishtail result.
 *
 * Crash Table 2 — Fishtails (RAW summary, in terms of severity):
 *  - -1, 0, 1, 2  → Minor fishtail (1 square), -3 to hit
 *  - 3, 4         → Major fishtail (2 squares), -6 to hit
 *  - 5            → Minor fishtail, then Crash Table 1, no auto fire
 *  - 6–9          → Major fishtail, then Crash Table 1, no auto fire
 *  - 10+          → Major + minor (3 squares total), then Crash Table 1, no auto fire
 *
 * Direction (left/right) must be chosen or rolled by the player;
 * this function does not roll any dice.
 *
 * @param {Actor} actor   The vehicle actor
 * @param {number} value  Crash Table 2 severity (typically margin of failure)
 * @returns {object}      Structured fishtail outcome
 */
export async function resolveFishtail(actor, value) {
  // ------------------------------------------------------------
  // Normalize result into categories
  // ------------------------------------------------------------
  let fishtailType = null;      // "minor", "major", "major+minor"
  let squares = 0;              // how many squares rear corner moves
  let weaponPenalty = 0;        // -3, -6, or 0
  let autoFireAllowed = true;   // false when Crash Table 1 is invoked
  let triggersCrashTable1 = false;

  if (value <= 2) {
    fishtailType = "minor";
    squares = 1;
    weaponPenalty = -3;
    autoFireAllowed = true;
    triggersCrashTable1 = false;
  } else if (value <= 4) {
    fishtailType = "major";
    squares = 2;
    weaponPenalty = -6;
    autoFireAllowed = true;
    triggersCrashTable1 = false;
  } else if (value === 5) {
    fishtailType = "minor";
    squares = 1;
    weaponPenalty = 0;      // RAW shifts to "no auto fire" instead of a flat penalty
    autoFireAllowed = false;
    triggersCrashTable1 = true;
  } else if (value >= 6 && value <= 9) {
    fishtailType = "major";
    squares = 2;
    weaponPenalty = 0;
    autoFireAllowed = false;
    triggersCrashTable1 = true;
  } else {
    // 10 or more
    fishtailType = "major+minor";
    squares = 3;            // total movement: 2 + 1
    weaponPenalty = 0;
    autoFireAllowed = false;
    triggersCrashTable1 = true;
  }

  // ------------------------------------------------------------
  // Weapon fire penalties for this turn
  // (Integration with your attack workflow will consume these flags.)
  // ------------------------------------------------------------
  const weaponFlags = {
    penalty: weaponPenalty,
    autoFireAllowed
  };

  // Optionally store this on the actor for the current turn
  await actor.update({
    "system.combat.fishtailPenalty": weaponPenalty,
    "system.combat.autoFireAllowed": autoFireAllowed
  });

  // ------------------------------------------------------------
  // Player-facing direction choice
  // ------------------------------------------------------------
  // We no longer roll dice here. Instead, we inform the table that a
  // fishtail occurred and that they must choose/roll direction.
  // Direction is left as null for now; Phase 4 UI can drive this.
  const direction = null;

  ChatMessage.create({
    speaker: { alias: actor.name },
    content: `
      🔁 <b>Fishtail!</b> Crash Table 2 severity <b>${value}</b>.<br>
      Type: <b>${fishtailType}</b> (${squares} square${squares !== 1 ? "s" : ""})<br>
      Direction: <b>Left or Right (player decides / rolls)</b><br>
      ${weaponPenalty !== 0
        ? `Any further <b>aimed weapon fire</b> this turn is at <b>${weaponPenalty}</b> to hit.`
        : autoFireAllowed
          ? "No additional weapon fire penalties this turn."
          : "No further <b>automatic weapon fire</b> permitted from this vehicle this turn."
      }
    `
  });

   // ------------------------------------------------------------
  // Return structured outcome for Crash Table 2 resolver
  // ------------------------------------------------------------
  return {
    type: "fishtail",
    table: 2,
    severity: value,
    fishtailType,
    squares,
    direction,            // null for now — Phase 4 UI will set this
    weaponFlags,
    triggersCrashTable1,
    temporarySpeed: null  // placeholder; can be set by future physics rules
  };
}
