// module/movement/armor-damage-router.js
// ------------------------------------------------------------
// Car Wars Deluxe — Armor Damage Router (Phase 2)
// Pure logic only. Computes how damage *would* be applied.
// Does NOT modify actor data.
// ------------------------------------------------------------

export function resolveArmorDamage(vehicle, { facing, damage, isCollision = false }) {
  const sys = vehicle.system;

  const outcome = {
    type: "armor-damage",
    facing,
    incoming: damage,

    ramplate: { applied: 0, remaining: null, destroyed: false },
    wheelguards: { applied: 0 },
    wheelhubs: { applied: 0 },

    armor: { applied: 0, remaining: null, breached: false },
    componentArmor: [],

    overflow: 0,
    internalDamage: []
  };

  let remaining = damage;

  // ------------------------------------------------------------
  // 1. RAMPLATE (front-only, collision-only)
  // ------------------------------------------------------------
  if (isCollision && facing === "front" && sys.armor.ramplate?.has) {
    const rp = sys.armor.ramplate;
    const applied = Math.min(rp.dpCurrent, remaining);

    outcome.ramplate.applied = applied;
    outcome.ramplate.remaining = rp.dpCurrent - applied;
    outcome.ramplate.destroyed = outcome.ramplate.remaining <= 0;

    remaining -= applied;
    if (remaining <= 0) return outcome;
  }

  // ------------------------------------------------------------
  // 2. WHEELGUARDS / WHEELHUBS (underbody hits)
  // ------------------------------------------------------------
  if (facing === "under") {
    // Wheelguards
    const wg = sys.armor.wheelguards ?? [];
    const wgTotal = wg.reduce((a, b) => a + b, 0);

    if (wgTotal > 0) {
      const applied = Math.min(wgTotal, remaining);
      outcome.wheelguards.applied = applied;
      remaining -= applied;

      if (remaining <= 0) return outcome;
    }

    // Wheelhubs
    const wh = sys.armor.wheelhubs ?? [];
    const whTotal = wh.reduce((a, b) => a + b, 0);

    if (whTotal > 0) {
      const applied = Math.min(whTotal, remaining);
      outcome.wheelhubs.applied = applied;
      remaining -= applied;

      if (remaining <= 0) return outcome;
    }
  }

  // ------------------------------------------------------------
  // 3. MAIN ARMOR FACING
  // ------------------------------------------------------------
  const dpKey = `dp${capitalize(facing)}`;
  const breachKey = `breached${capitalize(facing)}`;

  const dp = sys.armor[dpKey] ?? 0;

  if (dp > 0) {
    const applied = Math.min(dp, remaining);

    outcome.armor.applied = applied;
    outcome.armor.remaining = dp - applied;
    outcome.armor.breached = outcome.armor.remaining <= 0;

    remaining -= applied;
    if (remaining <= 0) return outcome;
  }

  // ------------------------------------------------------------
  // 4. COMPONENT ARMOR (only if main armor breached)
  // ------------------------------------------------------------
  if (outcome.armor.breached && Array.isArray(sys.armor.componentArmor)) {
    for (const comp of sys.armor.componentArmor) {
      if (remaining <= 0) break;

      const applied = Math.min(comp.dpCurrent, remaining);

      outcome.componentArmor.push({
        name: comp.name,
        applied,
        remaining: comp.dpCurrent - applied,
        breached: comp.dpCurrent - applied <= 0
      });

      remaining -= applied;
    }

    if (remaining <= 0) return outcome;
  }

  // ------------------------------------------------------------
  // 5. INTERNAL DAMAGE (overflow)
  // ------------------------------------------------------------
  if (remaining > 0) {
    outcome.overflow = remaining;
    outcome.internalDamage.push({
      amount: remaining,
      note: "Overflow damage (internal routing not implemented in Phase 2)."
    });
  }

  return outcome;
}

// ------------------------------------------------------------
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
