//
// validate-tires.js
// Full validation for TIRES, TIRE OPTIONS, WHEELGUARDS, WHEELHUBS
//

export function validateTires(vehicle, catalogs, messages) {
  const tireId = vehicle.tireId;
  const tire = catalogs.tires[tireId];

  const body = catalogs.bodies[vehicle.bodyId];
  const tireOptions = vehicle.tireOptions ?? [];
  const wheelguards = vehicle.armor?.wheelguards ?? [];
  const wheelhubs = vehicle.armor?.wheelhubs ?? [];

  const wheelCount = vehicle.wheelCount ?? 0;

  // ------------------------------------------------------------
  // 1. Tire type must exist
  // ------------------------------------------------------------
  if (!tire) {
    messages.errors.push(`Tire type '${tireId}' does not exist.`);
    return;
  }

  // ------------------------------------------------------------
  // 2. Required fields
  // ------------------------------------------------------------
  const required = ["name", "dp", "weight", "cost", "hcModifier", "hazardModifier"];

  for (const field of required) {
    if (tire[field] === undefined || tire[field] === null) {
      messages.errors.push(
        `Tire type '${tire.name}' is missing required field '${field}'. Check tires.json.`
      );
    }
  }

  // ------------------------------------------------------------
  // 3. Tire count must match body/chassis rules
  // ------------------------------------------------------------
  validateTireCount(body, wheelCount, messages);

  // ------------------------------------------------------------
  // 4. Tire DP sanity
  // ------------------------------------------------------------
  if (tire.dp <= 0) {
    messages.errors.push(
      `Tire type '${tire.name}' has invalid DP '${tire.dp}'.`
    );
  }

  // ------------------------------------------------------------
  // 5. Tire weight sanity
  // ------------------------------------------------------------
  if (tire.weight <= 0) {
    messages.errors.push(
      `Tire type '${tire.name}' has invalid weight '${tire.weight}'.`
    );
  }

  // ------------------------------------------------------------
  // 6. Tire options validation
  // ------------------------------------------------------------
  validateTireOptions(tireOptions, catalogs, tire, messages);

  // ------------------------------------------------------------
  // 7. Wheelguards / Wheelhubs validation
  // ------------------------------------------------------------
  validateWheelguardsAndHubs(wheelguards, wheelhubs, wheelCount, catalogs, messages);

  // ------------------------------------------------------------
  // 8. Body restrictions (cycles, trikes, vans, etc.)
  // ------------------------------------------------------------
  validateTireBodyRestrictions(tire, body, messages);

  // ------------------------------------------------------------
  // 9. HC modifier sanity
  // ------------------------------------------------------------
  if (!Number.isFinite(tire.hcModifier)) {
    messages.errors.push(
      `Tire type '${tire.name}' has invalid HC modifier '${tire.hcModifier}'.`
    );
  }

  // ------------------------------------------------------------
  // 10. Hazard modifier sanity
  // ------------------------------------------------------------
  if (!Number.isFinite(tire.hazardModifier)) {
    messages.errors.push(
      `Tire type '${tire.name}' has invalid hazard modifier '${tire.hazardModifier}'.`
    );
  }
}

//
// ---------------------------------------------------------------------------
// Helper Functions (Option 1 — All helpers live at the bottom of this file)
// ---------------------------------------------------------------------------
//

function validateTireCount(body, wheelCount, messages) {
  if (!body) return;

  switch (body.category) {
    case "cycle":
      if (wheelCount !== 2) {
        messages.errors.push(`Cycles must have exactly 2 wheels.`);
      }
      break;

    case "trike":
    case "rev-trike":
      if (wheelCount !== 3) {
        messages.errors.push(`Trikes must have exactly 3 wheels.`);
      }
      break;

    default:
      if (wheelCount < 4) {
        messages.errors.push(`Cars must have at least 4 wheels.`);
      }
      break;
  }
}

function validateTireOptions(tireOptions, catalogs, tire, messages) {
  for (const optId of tireOptions) {
    const opt = catalogs.tireOptions[optId];

    if (!opt) {
      messages.errors.push(`Tire option '${optId}' does not exist.`);
      continue;
    }

    // Required fields
    const required = ["name", "cost", "weight", "hcModifier", "hazardModifier"];

    for (const field of required) {
      if (opt[field] === undefined || opt[field] === null) {
        messages.errors.push(
          `Tire option '${opt.name}' is missing required field '${field}'.`
        );
      }
    }

    // Compatibility
    if (opt.allowedTireTypes && !opt.allowedTireTypes.includes(tire.type)) {
      messages.errors.push(
        `Tire option '${opt.name}' cannot be used with tire type '${tire.type}'.`
      );
    }
  }
}

function validateWheelguardsAndHubs(wheelguards, wheelhubs, wheelCount, catalogs, messages) {
  if (wheelguards.length !== wheelCount) {
    messages.errors.push(
      `Wheelguards count (${wheelguards.length}) does not match wheel count (${wheelCount}).`
    );
  }

  if (wheelhubs.length !== wheelCount) {
    messages.errors.push(
      `Wheelhubs count (${wheelhubs.length}) does not match wheel count (${wheelCount}).`
    );
  }

  for (let i = 0; i < wheelCount; i++) {
    const wg = wheelguards[i] ?? 0;
    const wh = wheelhubs[i] ?? 0;

    // RAW: max 40 lbs per wheel
    if (wg > 40) {
      messages.errors.push(
        `Wheelguard on wheel ${i + 1} exceeds max weight (40 lbs).`
      );
    }

    if (wh > 40) {
      messages.errors.push(
        `Wheelhub on wheel ${i + 1} exceeds max weight (40 lbs).`
      );
    }
  }
}

function validateTireBodyRestrictions(tire, body, messages) {
  if (!tire.allowedBodyCategories) return;

  if (!tire.allowedBodyCategories.includes(body.category)) {
    messages.errors.push(
      `Tire type '${tire.name}' cannot be installed on body type '${body.category}'.`
    );
  }
}
