//
// validate-weight.js
// Full validation for WEIGHT across all subsystems
//

export function validateWeight(vehicle, catalogs, messages) {
  const body = catalogs.bodies[vehicle.bodyId];
  const chassis = catalogs.chassis[vehicle.chassisId];
  const bodyMod = vehicle.bodyModId ? catalogs.bodyMods[vehicle.bodyModId] : null;

  if (!body || !chassis) {
    messages.errors.push(`Cannot validate weight: missing body or chassis.`);
    return;
  }

  // ------------------------------------------------------------
  // 1. Compute max weight (body × chassis multiplier)
  // ------------------------------------------------------------
  let maxWeight = body.maxWeight ?? 0;

  if (chassis.maxWeightMultiplier) {
    maxWeight *= chassis.maxWeightMultiplier;
  }

  if (bodyMod?.weightModifier) {
    maxWeight += bodyMod.weightModifier;
  }

  if (maxWeight <= 0) {
    messages.errors.push(
      `Invalid max weight calculation (${maxWeight}).`
    );
    return;
  }

  // ------------------------------------------------------------
  // 2. Compute weight from all subsystems
  // ------------------------------------------------------------
  const weights = {
    powerplant: computePowerplantWeight(vehicle, catalogs),
    gasTank: computeGasTankWeight(vehicle, catalogs),
    armor: computeArmorWeight(vehicle, catalogs),
    componentArmor: computeComponentArmorWeight(vehicle, catalogs),
    wheelguards: computeWheelguardWeight(vehicle),
    wheelhubs: computeWheelhubWeight(vehicle),
    weapons: computeWeaponWeight(vehicle, catalogs),
    ammo: computeAmmoWeight(vehicle, catalogs),
    accessories: computeAccessoryWeight(vehicle, catalogs),
    crew: computeCrewWeight(vehicle),
    cargo: computeCargoWeight(vehicle),
    turrets: computeTurretWeight(vehicle),
    cupolas: computeCupolaWeight(vehicle),
    tires: computeTireWeight(vehicle, catalogs)
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  // ------------------------------------------------------------
  // 3. Validate total weight
  // ------------------------------------------------------------
  if (totalWeight <= 0) {
    messages.errors.push(
      `Total vehicle weight is invalid (${totalWeight}).`
    );
  }

  if (totalWeight > maxWeight) {
    messages.errors.push(
      `Vehicle weight ${totalWeight} lbs exceeds maximum allowed ${maxWeight} lbs.`
    );
  }

  // ------------------------------------------------------------
  // 4. Informational breakdown
  // ------------------------------------------------------------
  messages.info.push(
    `Weight usage: ${totalWeight}/${maxWeight} lbs (PP ${weights.powerplant}, Gas ${weights.gasTank}, Armor ${weights.armor}, CompArmor ${weights.componentArmor}, Weapons ${weights.weapons}, Ammo ${weights.ammo}, Accessories ${weights.accessories}, Crew ${weights.crew}, Cargo ${weights.cargo}, Tires ${weights.tires})`
  );
}

//
// ---------------------------------------------------------------------------
// Helper Functions (Option 1 — All helpers live at the bottom of this file)
// ---------------------------------------------------------------------------
//

function computePowerplantWeight(vehicle, catalogs) {
  const pp = catalogs.powerplants[vehicle.powerPlantId];
  return pp?.weight ?? 0;
}

function computeGasTankWeight(vehicle, catalogs) {
  const tank = catalogs.gasTanks[vehicle.gasTankId];
  const gallons = vehicle.gas?.gallons ?? 0;
  if (!tank) return 0;
  return gallons * tank.weightPerGallon;
}

function computeArmorWeight(vehicle, catalogs) {
  const armorType = vehicle.armor?.type;
  const armor = catalogs.armor[armorType];
  if (!armor) return 0;

  const facings = ["front", "back", "left", "right", "top", "under"];
  const totalPoints = facings.reduce((sum, f) => sum + (vehicle.armor[f] ?? 0), 0);

  return totalPoints * armor.weightPerPoint;
}

function computeComponentArmorWeight(vehicle, catalogs) {
  const compArmor = vehicle.armor?.componentArmor ?? [];
  const armorType = vehicle.armor?.type;
  const armor = catalogs.armor[armorType];
  if (!armor) return 0;

  let total = 0;

  for (const comp of compArmor) {
    const pts = comp.points ?? 0;
    total += pts * armor.weightPerPoint;
  }

  return total;
}

function computeWheelguardWeight(vehicle) {
  const wheelguards = vehicle.armor?.wheelguards ?? [];
  return wheelguards.reduce((a, b) => a + (b ?? 0), 0);
}

function computeWheelhubWeight(vehicle) {
  const wheelhubs = vehicle.armor?.wheelhubs ?? [];
  return wheelhubs.reduce((a, b) => a + (b ?? 0), 0);
}

function computeWeaponWeight(vehicle, catalogs) {
  const weapons = vehicle.weapons ?? [];
  let total = 0;

  for (const w of weapons) {
    const item = catalogs.weapons[w.itemId];
    if (!item) continue;
    total += item.weight ?? 0;
  }

  return total;
}

function computeAmmoWeight(vehicle, catalogs) {
  const weapons = vehicle.weapons ?? [];
  let total = 0;

  for (const w of weapons) {
    const item = catalogs.weapons[w.itemId];
    if (!item) continue;

    const ammo = w.ammo ?? 0;
    const lbPerRound = item.lbPerRound ?? 0;

    total += ammo * lbPerRound;
  }

  return total;
}

function computeAccessoryWeight(vehicle, catalogs) {
  const accessories = vehicle.accessories ?? [];
  let total = 0;

  for (const acc of accessories) {
    const item = catalogs.accessories[acc.itemId];
    if (!item) continue;
    total += item.weight ?? 0;
  }

  return total;
}

function computeCrewWeight(vehicle) {
  const driver = vehicle.crew?.driver ?? {};
  const gunner = vehicle.crew?.gunner ?? {};

  const driverWeight = driver.weight ?? 0;
  const gunnerWeight = gunner.weight ?? 0;

  return driverWeight + gunnerWeight;
}

function computeCargoWeight(vehicle) {
  return vehicle.cargo?.weight ?? 0;
}

function computeTurretWeight(vehicle) {
  const turrets = vehicle.turrets ?? {};
  let total = 0;

  for (const key of Object.keys(turrets)) {
    total += turrets[key].weight ?? 0;
  }

  return total;
}

function computeCupolaWeight(vehicle) {
  const cupolas = vehicle.cupolas ?? {};
  let total = 0;

  for (const key of Object.keys(cupolas)) {
    total += cupolas[key].weight ?? 0;
  }

  return total;
}

function computeTireWeight(vehicle, catalogs) {
  const tire = catalogs.tires[vehicle.tireId];
  const wheelCount = vehicle.wheelCount ?? 0;

  if (!tire) return 0;

  return tire.weight * wheelCount;
}
