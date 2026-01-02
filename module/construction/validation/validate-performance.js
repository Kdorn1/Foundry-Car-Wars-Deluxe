//
// validate-performance.js
// Full validation for ACCELERATION, TOP SPEED, HC, HAZARDS, PF, MODIFIERS
//

export function validatePerformance(vehicle, catalogs, messages) {
  const body = catalogs.bodies[vehicle.bodyId];
  const suspension = catalogs.suspension[vehicle.suspensionId];
  const tire = catalogs.tires[vehicle.tireId];
  const pp = catalogs.powerplants[vehicle.powerPlantId];
  const engineMods = vehicle.engineMods ?? [];
  const accessories = vehicle.accessories ?? [];

  if (!body || !suspension || !tire || !pp) {
    messages.errors.push(`Cannot validate performance: missing body, suspension, tire, or power plant.`);
    return;
  }

  // ------------------------------------------------------------
  // 1. Compute PF (power factor)
  // ------------------------------------------------------------
  const pf = computeModifiedPF(pp, engineMods);

  if (pf <= 0) {
    messages.errors.push(`Invalid PF calculation (${pf}).`);
    return;
  }

  // ------------------------------------------------------------
  // 2. Compute expected acceleration
  // ------------------------------------------------------------
  const expectedAccel = computeAcceleration(pf);

  if (vehicle.performance?.accel !== expectedAccel) {
    messages.warnings.push(
      `Acceleration mismatch: expected ${expectedAccel} mph/turn based on PF ${pf}.`
    );
  }

  // ------------------------------------------------------------
  // 3. Compute expected top speed
  // ------------------------------------------------------------
  const expectedTopSpeed = computeTopSpeed(pf);

  if (vehicle.performance?.topSpeed !== expectedTopSpeed) {
    messages.warnings.push(
      `Top speed mismatch: expected ${expectedTopSpeed} mph based on PF ${pf}.`
    );
  }

  // ------------------------------------------------------------
  // 4. Compute expected MPG (gas engines only)
  // ------------------------------------------------------------
  if (pp.type === "gas") {
    const expectedMPG = computeMPG(pp, engineMods);

    if (vehicle.performance?.mpg !== expectedMPG) {
      messages.warnings.push(
        `MPG mismatch: expected ${expectedMPG} MPG based on engine type and mods.`
      );
    }
  }

  // ------------------------------------------------------------
  // 5. Compute Handling Class (HC)
  // ------------------------------------------------------------
  const expectedHC = computeHC(body, suspension, tire, accessories);

  if (vehicle.performance?.hc !== expectedHC) {
    messages.warnings.push(
      `HC mismatch: expected HC ${expectedHC} based on body, suspension, tires, and accessories.`
    );
  }

  // ------------------------------------------------------------
  // 6. Hazard modifier sanity
  // ------------------------------------------------------------
  const expectedHazardMod = computeHazardModifier(tire, accessories);

  if (vehicle.performance?.hazardMod !== expectedHazardMod) {
    messages.warnings.push(
      `Hazard modifier mismatch: expected ${expectedHazardMod}.`
    );
  }

  // ------------------------------------------------------------
  // 7. Range validation (gas engines only)
  // ------------------------------------------------------------
  if (pp.type === "gas") {
    const gallons = vehicle.gas?.gallons ?? 0;
    const expectedRange = gallons * computeMPG(pp, engineMods);

    if (vehicle.performance?.range !== expectedRange) {
      messages.warnings.push(
        `Range mismatch: expected ${expectedRange} miles based on ${gallons} gallons.`
      );
    }
  }

  // ------------------------------------------------------------
  // 8. Informational breakdown
  // ------------------------------------------------------------
  messages.info.push(
    `Performance: Accel ${expectedAccel}, Top ${expectedTopSpeed}, HC ${expectedHC}, HazardMod ${expectedHazardMod}`
  );
}

//
// ---------------------------------------------------------------------------
// Helper Functions (Option 1 — All helpers live at the bottom of this file)
// ---------------------------------------------------------------------------
//

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

function computeHC(body, suspension, tire, accessories) {
  let hc = body.baseHC ?? 0;

  // Suspension HC modifier
  hc += suspension.hcModifier ?? 0;

  // Tire HC modifier
  hc += tire.hcModifier ?? 0;

  // Accessory HC modifiers (spoilers, airdams, HD shocks, etc.)
  for (const acc of accessories) {
    if (acc.hcModifier) {
      hc += acc.hcModifier;
    }
  }

  // Spoiler + Airdam combo rule
  const hasSpoiler = accessories.some(a => a.itemId === "spoiler");
  const hasAirdam = accessories.some(a => a.itemId === "airdam");

  if (hasSpoiler && hasAirdam) {
    hc += 1; // RAW: HC +1 when both installed
  }

  return hc;
}

function computeHazardModifier(tire, accessories) {
  let mod = tire.hazardModifier ?? 0;

  // HD shocks reduce all road hazards by D1
  const hasHDShocks = accessories.some(a => a.itemId === "hd-shocks");
  if (hasHDShocks) mod -= 1;

  // Anti-lock brakes reduce braking hazards by D1
  const hasABS = accessories.some(a => a.itemId === "anti-lock-brakes");
  if (hasABS) mod -= 1;

  return mod;
}
