//
// validate-gas-tank.js
// Full validation for GAS TANKS, CAPACITY, WEIGHT, COST, ENGINE COMPATIBILITY
//

export function validateGasTank(vehicle, catalogs, messages) {
  const tankId = vehicle.gasTankId;
  const ppId = vehicle.powerPlantId;

  const tank = catalogs.gasTanks[tankId];
  const pp = catalogs.powerplants[ppId];
  const body = catalogs.bodies[vehicle.bodyId];

  // ------------------------------------------------------------
  // 1. If no gas tank is selected
  // ------------------------------------------------------------
  if (!tankId) {
    if (pp?.type === "gas") {
      messages.errors.push(`Gas engines require a gas tank.`);
    }
    return;
  }

  // ------------------------------------------------------------
  // 2. Gas tank must exist
  // ------------------------------------------------------------
  if (!tank) {
    messages.errors.push(`Gas tank '${tankId}' does not exist.`);
    return;
  }

  // ------------------------------------------------------------
  // 3. Required fields
  // ------------------------------------------------------------
  const required = ["name", "weightPerGallon", "costPerGallon", "dp", "spaceTable"];

  for (const field of required) {
    if (tank[field] === undefined || tank[field] === null) {
      messages.errors.push(
        `Gas tank '${tank.name}' is missing required field '${field}'. Check gas-tanks.json.`
      );
    }
  }

  // ------------------------------------------------------------
  // 4. Electric engines cannot use gas tanks
  // ------------------------------------------------------------
  if (pp?.type === "electric") {
    messages.errors.push(
      `Electric power plants cannot use gas tanks.`
    );
  }

  // ------------------------------------------------------------
  // 5. Gallon amount sanity
  // ------------------------------------------------------------
  const gallons = vehicle.gas?.gallons ?? 0;

  if (gallons <= 0) {
    messages.errors.push(
      `Gas tank must contain at least 1 gallon.`
    );
  }

  if (!Number.isFinite(gallons)) {
    messages.errors.push(
      `Gas tank gallon amount must be a number.`
    );
  }

  // ------------------------------------------------------------
  // 6. Weight = gallons × weight/gal
  // ------------------------------------------------------------
  const expectedWeight = gallons * tank.weightPerGallon;

  if (vehicle.gas?.weight !== expectedWeight) {
    messages.warnings.push(
      `Gas tank weight mismatch: expected ${expectedWeight} lbs based on ${gallons} gallons.`
    );
  }

  // ------------------------------------------------------------
  // 7. Cost = gallons × cost/gal
  // ------------------------------------------------------------
  const expectedCost = gallons * tank.costPerGallon;

  if (vehicle.gas?.cost !== expectedCost) {
    messages.warnings.push(
      `Gas tank cost mismatch: expected $${expectedCost} based on ${gallons} gallons.`
    );
  }

  // ------------------------------------------------------------
  // 8. DP sanity
  // ------------------------------------------------------------
  if (tank.dp <= 0) {
    messages.errors.push(
      `Gas tank '${tank.name}' has invalid DP '${tank.dp}'.`
    );
  }

  // ------------------------------------------------------------
  // 9. Space usage (Excel’s “space per gallon” table)
  // ------------------------------------------------------------
  const expectedSpaces = computeGasTankSpaces(gallons, tank.spaceTable);

  if (vehicle.gas?.spaces !== expectedSpaces) {
    messages.warnings.push(
      `Gas tank space mismatch: expected ${expectedSpaces} spaces for ${gallons} gallons.`
    );
  }

  // ------------------------------------------------------------
  // 10. Body restrictions (boats, cycles, etc.)
  // ------------------------------------------------------------
  validateGasTankBodyRestrictions(tank, body, messages);

  // ------------------------------------------------------------
  // 11. Engine compatibility (economy, heavy-duty, racing)
  // ------------------------------------------------------------
  validateGasTankEngineCompatibility(tank, pp, messages);
}

//
// ---------------------------------------------------------------------------
// Helper Functions (Option 1 — All helpers live at the bottom of this file)
// ---------------------------------------------------------------------------
//

function computeGasTankSpaces(gallons, spaceTable) {
  // Excel rule:
  //  0–5 gal: 0 spaces
  //  6–15 gal: 1 space
  // 16–25 gal: 2 spaces
  // 26–35 gal: 3 spaces
  // 36+ gal: 4+ (varies by catalog)
  //
  // Your JSON tank.spaceTable defines these breakpoints.

  for (const entry of spaceTable) {
    if (gallons >= entry.min && gallons <= entry.max) {
      return entry.spaces;
    }
  }

  // If gallons exceed all defined ranges, use the last entry’s rule
  const last = spaceTable[spaceTable.length - 1];
  return last.spaces;
}

function validateGasTankBodyRestrictions(tank, body, messages) {
  if (!tank.allowedBodyCategories) return;

  if (!tank.allowedBodyCategories.includes(body.category)) {
    messages.errors.push(
      `Gas tank '${tank.name}' cannot be installed on body type '${body.category}'.`
    );
  }
}

function validateGasTankEngineCompatibility(tank, pp, messages) {
  if (!pp) return;

  // Example: economy tanks only allowed on economy engines
  if (tank.specialRules?.includes("economy-only") &&
      !pp.specialRules?.includes("economy")) {
    messages.errors.push(
      `Gas tank '${tank.name}' may only be used with economy engines.`
    );
  }

  // Heavy-duty tanks
  if (tank.specialRules?.includes("heavy-duty") &&
      !pp.specialRules?.includes("heavy-duty")) {
    messages.errors.push(
      `Gas tank '${tank.name}' requires a heavy-duty engine.`
    );
  }

  // Racing tanks
  if (tank.specialRules?.includes("racing") &&
      !pp.specialRules?.includes("racing")) {
    messages.errors.push(
      `Gas tank '${tank.name}' requires a racing engine.`
    );
  }
}
