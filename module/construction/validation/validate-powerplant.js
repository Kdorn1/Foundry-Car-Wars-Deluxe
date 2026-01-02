//
// validate-powerplant.js
// Full validation for POWER PLANTS, ENGINE MODS, PF, ACCEL, TOP SPEED, MPG
//

export function validatePowerplant(vehicle, catalogs, messages) {
  const ppId = vehicle.powerPlantId;
  const pp = catalogs.powerplants[ppId];

  const body = catalogs.bodies[vehicle.bodyId];
  const engineMods = vehicle.engineMods ?? [];

  // ------------------------------------------------------------
  // 1. Power plant must exist
  // ------------------------------------------------------------
  if (!pp) {
    messages.errors.push(`Power plant '${ppId}' does not exist.`);
    return;
  }

  // ------------------------------------------------------------
  // 2. Required fields
  // ------------------------------------------------------------
  const required = ["name", "pf", "weight", "spaces", "cost", "baseMPG", "dp"];

  for (const field of required) {
    if (pp[field] === undefined || pp[field] === null) {
      messages.errors.push(
        `Power plant '${pp.name}' is missing required field '${field}'. Check powerplants.json.`
      );
    }
  }

  // ------------------------------------------------------------
  // 3. Electric vs Gas rules
  // ------------------------------------------------------------
  if (pp.type === "electric") {
    if (vehicle.gasTankId) {
      messages.errors.push(
        `Electric power plants cannot use gas tanks.`
      );
    }
  }

  if (pp.type === "gas") {
    if (!vehicle.gasTankId) {
      messages.errors.push(
        `Gas power plants require a gas tank.`
      );
    }
  }

  // ------------------------------------------------------------
  // 4. Engine mod validation
  // ------------------------------------------------------------
  validateEngineMods(engineMods, catalogs, messages);

  // ------------------------------------------------------------
  // 5. PF vs total weight (RAW + Excel)
  // ------------------------------------------------------------
  const pf = computeModifiedPF(pp, engineMods);
  const totalWeight = vehicle.weight?.total ?? 0;

  if (pf < totalWeight / 100) {
    messages.errors.push(
      `Power plant PF ${pf} is too low for vehicle weight ${totalWeight} lbs.`
    );
  }

  // ------------------------------------------------------------
  // 6. Acceleration validation (Excel PF table)
  // ------------------------------------------------------------
  const accel = computeAcceleration(pf);

  if (accel !== vehicle.performance?.accel) {
    messages.warnings.push(
      `Acceleration mismatch: expected ${accel} mph/turn based on PF ${pf}.`
    );
  }

  // ------------------------------------------------------------
  // 7. Top speed validation (Excel PF table)
  // ------------------------------------------------------------
  const topSpeed = computeTopSpeed(pf);

  if (topSpeed !== vehicle.performance?.topSpeed) {
    messages.warnings.push(
      `Top speed mismatch: expected ${topSpeed} mph based on PF ${pf}.`
    );
  }

  // ------------------------------------------------------------
  // 8. MPG validation (Excel PF table)
  // ------------------------------------------------------------
  const mpg = computeMPG(pp, engineMods);

  if (pp.type === "gas" && mpg !== vehicle.performance?.mpg) {
    messages.warnings.push(
      `MPG mismatch: expected ${mpg} MPG based on engine type and mods.`
    );
  }

  // ------------------------------------------------------------
  // 9. Space sanity
  // ------------------------------------------------------------
  if (pp.spaces < 0) {
    messages.errors.push(
      `Power plant '${pp.name}' cannot use negative spaces.`
    );
  }

  // ------------------------------------------------------------
  // 10. Weight sanity
  // ------------------------------------------------------------
  if (pp.weight <= 0) {
    messages.errors.push(
      `Power plant '${pp.name}' has invalid weight '${pp.weight}'.`
    );
  }

  // ------------------------------------------------------------
  // 11. DP sanity
  // ------------------------------------------------------------
  if (pp.dp <= 0) {
    messages.errors.push(
      `Power plant '${pp.name}' has invalid DP '${pp.dp}'.`
    );
  }

  // ------------------------------------------------------------
  // 12. Body restrictions (race engines, cycle engines, etc.)
  // ------------------------------------------------------------
  validatePowerplantBodyRestrictions(pp, body, messages);
}

//
// ---------------------------------------------------------------------------
// Helper Functions (Option 1 — All helpers live at the bottom of this file)
// ---------------------------------------------------------------------------
//

function validateEngineMods(engineMods, catalogs, messages) {
  for (const modId of engineMods) {
    const mod = catalogs.engineMods[modId];

    if (!mod) {
      messages.errors.push(`Engine mod '${modId}' does not exist.`);
      continue;
    }

    // Required fields
    const required = ["name", "pfModifier", "mpgModifier", "cost", "weight"];

    for (const field of required) {
      if (mod[field] === undefined || mod[field] === null) {
        messages.errors.push(
          `Engine mod '${modId}' is missing required field '${field}'.`
        );
      }
    }

    // Sanity
    if (mod.weight < 0) {
      messages.errors.push(
        `Engine mod '${mod.name}' has invalid weight '${mod.weight}'.`
      );
    }
  }
}

function computeModifiedPF(pp, engineMods) {
  let pf = pp.pf;

  for (const mod of engineMods) {
    if (mod.pfModifier) {
      pf += mod.pfModifier;
    }
  }

  return pf;
}

function computeAcceleration(pf) {
  // RAW + Excel PF → Accel table
  if (pf >= 2500) return 15;
  if (pf >= 1900) return 12;
  if (pf >= 1300) return 10;
  if (pf >= 700) return 5;
  if (pf >= 500) return 3;
  if (pf >= 300) return 2;
  return 1;
}

function computeTopSpeed(pf) {
  // RAW + Excel PF → Top Speed table
  if (pf >= 2500) return 150;
  if (pf >= 1900) return 130;
  if (pf >= 1300) return 110;
  if (pf >= 700) return 90;
  if (pf >= 500) return 70;
  if (pf >= 300) return 60;
  return 50;
}

function computeMPG(pp, engineMods) {
  let mpg = pp.baseMPG;

  for (const mod of engineMods) {
    if (mod.mpgModifier) {
      mpg += mod.mpgModifier;
    }
  }

  return mpg;
}

function validatePowerplantBodyRestrictions(pp, body, messages) {
  if (!pp.allowedBodyCategories) return;

  if (!pp.allowedBodyCategories.includes(body.category)) {
    messages.errors.push(
      `Power plant '${pp.name}' cannot be installed in body type '${body.category}'.`
    );
  }
}
