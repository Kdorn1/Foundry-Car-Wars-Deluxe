//
// validate-internal.js
// Full validation for INTERNAL SYSTEMS, COMPONENT ARMOR, FIRE, EXPLOSIONS, INTERNAL DP
//

export function validateInternal(vehicle, catalogs, messages) {
  const body = catalogs.bodies[vehicle.bodyId];
  const pp = catalogs.powerplants[vehicle.powerPlantId];
  const tank = catalogs.gasTanks[vehicle.gasTankId];

  if (!body) {
    messages.errors.push(`Cannot validate internal systems: body '${vehicle.bodyId}' does not exist.`);
    return;
  }

  // ------------------------------------------------------------
  // 1. Component Armor legality
  // ------------------------------------------------------------
  validateComponentArmor(vehicle, catalogs, messages);

  // ------------------------------------------------------------
  // 2. Internal DP sanity (power plant, gas tank, crew compartment)
  // ------------------------------------------------------------
  validateInternalDP(vehicle, pp, tank, messages);

  // ------------------------------------------------------------
  // 3. Fire rules (RAW + Excel)
  // ------------------------------------------------------------
  validateFireSystems(vehicle, catalogs, messages);

  // ------------------------------------------------------------
  // 4. Ammo explosion rules
  // ------------------------------------------------------------
  validateAmmoExplosionRisk(vehicle, catalogs, messages);

  // ------------------------------------------------------------
  // 5. Gas tank explosion rules
  // ------------------------------------------------------------
  validateGasTankExplosionRisk(vehicle, tank, messages);

  // ------------------------------------------------------------
  // 6. Power plant explosion rules
  // ------------------------------------------------------------
  validatePowerplantExplosionRisk(vehicle, pp, messages);

  // ------------------------------------------------------------
  // 7. Internal component legality (crew, controls, etc.)
  // ------------------------------------------------------------
  validateInternalComponents(vehicle, messages);

  // ------------------------------------------------------------
  // 8. Informational summary
  // ------------------------------------------------------------
  messages.info.push(`Internal systems validated (component armor, fire, explosions, DP).`);
}

//
// ---------------------------------------------------------------------------
// Helper Functions (Option 1 — All helpers live at the bottom of this file)
// ---------------------------------------------------------------------------
//

function validateComponentArmor(vehicle, catalogs, messages) {
  const compArmor = vehicle.armor?.componentArmor ?? [];
  const armorType = vehicle.armor?.type;
  const armor = catalogs.armor[armorType];

  if (!armor) return;

  for (const comp of compArmor) {
    const pts = comp.points ?? 0;
    const spaces = comp.spaces ?? 0;

    if (spaces <= 0) {
      messages.errors.push(
        `Component armor '${comp.location}' must specify spaces > 0.`
      );
      continue;
    }

    // RAW: max 20 lbs per component space
    const maxWeight = 20 * spaces;
    const weight = pts * armor.weightPerPoint;

    if (weight > maxWeight) {
      messages.errors.push(
        `Component armor '${comp.location}' exceeds max weight (${weight} lbs > ${maxWeight} lbs).`
      );
    }

    // Composite armor rule
    if (armorType === "composite" && !comp.baseArmorType) {
      messages.errors.push(
        `Component armor '${comp.location}' using composite must specify baseArmorType.`
      );
    }
  }
}

function validateInternalDP(vehicle, pp, tank, messages) {
  // Power plant DP
  if (pp && pp.dp <= 0) {
    messages.errors.push(
      `Power plant DP is invalid (${pp.dp}).`
    );
  }

  // Gas tank DP
  if (tank && tank.dp <= 0) {
    messages.errors.push(
      `Gas tank DP is invalid (${tank.dp}).`
    );
  }

  // Crew compartment DP (if modeled)
  const crewDP = vehicle.internal?.crewCompartmentDP;
  if (crewDP !== undefined && crewDP <= 0) {
    messages.errors.push(
      `Crew compartment DP is invalid (${crewDP}).`
    );
  }
}

function validateFireSystems(vehicle, catalogs, messages) {
  const accessories = vehicle.accessories ?? [];
  const hasFE = accessories.some(a => a.itemId === "fire-extinguisher");
  const hasIFE = accessories.some(a => a.itemId === "improved-fire-extinguisher");

  // RAW: vehicles without FE risk uncontrolled fire
  if (!hasFE && !hasIFE) {
    messages.warnings.push(
      `Vehicle has no fire extinguisher — fire cannot be suppressed.`
    );
  }

  if (hasIFE) {
    messages.info.push(
      `Improved Fire Extinguisher installed: fire suppression improved.`
    );
  }
}

function validateAmmoExplosionRisk(vehicle, catalogs, messages) {
  const weapons = vehicle.weapons ?? [];

  for (const w of weapons) {
    const item = catalogs.weapons[w.itemId];
    if (!item) continue;

    const ammo = w.ammo ?? 0;

    if (ammo > 0 && item.explosiveAmmo) {
      messages.warnings.push(
        `Weapon '${item.name}' carries explosive ammo — internal explosion risk.`
      );
    }
  }
}

function validateGasTankExplosionRisk(vehicle, tank, messages) {
  if (!tank) return;

  if (tank.type === "gas" && tank.dp < 10) {
    messages.warnings.push(
      `Gas tank DP is low — high explosion risk if breached.`
    );
  }
}

function validatePowerplantExplosionRisk(vehicle, pp, messages) {
  if (!pp) return;

  if (pp.type === "gas" && pp.dp < 10) {
    messages.warnings.push(
      `Gas engine DP is low — explosion risk if breached.`
    );
  }

  if (pp.type === "electric" && pp.dp < 5) {
    messages.warnings.push(
      `Electric power plant DP is low — fire risk if breached.`
    );
  }
}

function validateInternalComponents(vehicle, messages) {
  const crew = vehicle.crew ?? {};

  // Driver required
  if (!crew.driver) {
    messages.errors.push(`Vehicle must have a driver.`);
  }

  // Gunner optional but must be valid if present
  if (crew.gunner && crew.gunner.weight <= 0) {
    messages.errors.push(`Gunner weight must be > 0.`);
  }

  // Controls
  if (!vehicle.internal?.controls) {
    messages.errors.push(`Vehicle must have driver controls.`);
  }
}
