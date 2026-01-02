//
// validate-spaces.js
// Full validation for SPACE USAGE across all subsystems
//

export function validateSpaces(vehicle, catalogs, messages) {
  const body = catalogs.bodies[vehicle.bodyId];
  const bodyMod = vehicle.bodyModId ? catalogs.bodyMods[vehicle.bodyModId] : null;

  if (!body) {
    messages.errors.push(`Cannot validate spaces: body '${vehicle.bodyId}' does not exist.`);
    return;
  }

  // ------------------------------------------------------------
  // 1. Compute total spaces available (body + body mods)
  // ------------------------------------------------------------
  let totalSpaces = body.spaces ?? 0;

  if (bodyMod?.spaceModifier) {
    totalSpaces += bodyMod.spaceModifier;
  }

  if (totalSpaces < 0) {
    messages.errors.push(
      `Body '${body.name}' has invalid total space calculation (${totalSpaces}).`
    );
    return;
  }

  // ------------------------------------------------------------
  // 2. Compute spaces used by all subsystems
  // ------------------------------------------------------------
  const usedSpaces = {
    powerplant: computePowerplantSpaces(vehicle, catalogs),
    gasTank: computeGasTankSpaces(vehicle, catalogs),
    weapons: computeWeaponSpaces(vehicle, catalogs),
    accessories: computeAccessorySpaces(vehicle, catalogs),
    componentArmor: computeComponentArmorSpaces(vehicle),
    turrets: computeTurretSpaces(vehicle),
    cupolas: computeCupolaSpaces(vehicle)
  };

  const totalUsed = Object.values(usedSpaces).reduce((a, b) => a + b, 0);

  // ------------------------------------------------------------
  // 3. Validate total space usage
  // ------------------------------------------------------------
  if (totalUsed > totalSpaces) {
    messages.errors.push(
      `Vehicle uses ${totalUsed} spaces but only ${totalSpaces} are available.`
    );
  }

  if (totalUsed < 0) {
    messages.errors.push(
      `Space usage calculation error: total used spaces < 0 (${totalUsed}).`
    );
  }

  // ------------------------------------------------------------
  // 4. Validate cargo spaces separately
  // ------------------------------------------------------------
  const cargoUsed = vehicle.cargo?.used ?? 0;
  const cargoTotal = body.cargoSpaces ?? 0;

  if (cargoUsed > cargoTotal) {
    messages.errors.push(
      `Vehicle uses ${cargoUsed} cargo spaces but body '${body.name}' only provides ${cargoTotal}.`
    );
  }

  // ------------------------------------------------------------
  // 5. Informational breakdown
  // ------------------------------------------------------------
  messages.info.push(
    `Space usage: ${totalUsed}/${totalSpaces} (PP ${usedSpaces.powerplant}, Gas ${usedSpaces.gasTank}, Weapons ${usedSpaces.weapons}, Accessories ${usedSpaces.accessories}, CompArmor ${usedSpaces.componentArmor}, Turrets ${usedSpaces.turrets}, Cupolas ${usedSpaces.cupolas})`
  );
}

//
// ---------------------------------------------------------------------------
// Helper Functions (Option 1 — All helpers live at the bottom of this file)
// ---------------------------------------------------------------------------
//

function computePowerplantSpaces(vehicle, catalogs) {
  const pp = catalogs.powerplants[vehicle.powerPlantId];
  if (!pp) return 0;
  return pp.spaces ?? 0;
}

function computeGasTankSpaces(vehicle, catalogs) {
  const tank = catalogs.gasTanks[vehicle.gasTankId];
  const gallons = vehicle.gas?.gallons ?? 0;

  if (!tank || gallons <= 0) return 0;

  // Use the same logic as validate-gas-tank.js
  for (const entry of tank.spaceTable) {
    if (gallons >= entry.min && gallons <= entry.max) {
      return entry.spaces;
    }
  }

  // If gallons exceed all defined ranges, use last entry
  return tank.spaceTable[tank.spaceTable.length - 1].spaces;
}

function computeWeaponSpaces(vehicle, catalogs) {
  const weapons = vehicle.weapons ?? [];
  let total = 0;

  for (const w of weapons) {
    const item = catalogs.weapons[w.itemId];
    if (!item) continue;

    // EWPs override weapon space usage
    if (w.mount === "ewp") {
      // EWP itself uses space, not the weapon
      const ewp = catalogs.accessories["external-weapon-pod"];
      if (ewp) total += ewp.spaces ?? 0;
      continue;
    }

    // Turrets/cupolas handled separately
    if (w.mount?.startsWith("turret") || w.mount?.startsWith("cupola")) {
      continue;
    }

    total += item.spaces ?? 0;
  }

  return total;
}

function computeAccessorySpaces(vehicle, catalogs) {
  const accessories = vehicle.accessories ?? [];
  let total = 0;

  for (const acc of accessories) {
    const item = catalogs.accessories[acc.itemId];
    if (!item) continue;

    total += item.spaces ?? 0;
  }

  return total;
}

function computeComponentArmorSpaces(vehicle) {
  const compArmor = vehicle.armor?.componentArmor ?? [];
  let total = 0;

  for (const comp of compArmor) {
    total += comp.spaces ?? 0;
  }

  return total;
}

function computeTurretSpaces(vehicle) {
  const turrets = vehicle.turrets ?? {};
  let total = 0;

  for (const key of Object.keys(turrets)) {
    const t = turrets[key];
    total += t.spacesUsed ?? 0;
  }

  return total;
}

function computeCupolaSpaces(vehicle) {
  const cupolas = vehicle.cupolas ?? {};
  let total = 0;

  for (const key of Object.keys(cupolas)) {
    const c = cupolas[key];
    total += c.spacesUsed ?? 0;
  }

  return total;
}
