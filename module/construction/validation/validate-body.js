//
// validate-body.js
// Full validation for BODY + BODY MODS
//

export function validateBody(vehicle, catalogs, messages) {
  const bodyId = vehicle.bodyId;
  const bodyModId = vehicle.bodyModId;

  const body = catalogs.bodies[bodyId];
  const bodyMod = bodyModId ? catalogs.bodyMods[bodyModId] : null;

  // ------------------------------------------------------------
  // 1. Body must exist
  // ------------------------------------------------------------
  if (!body) {
    messages.errors.push(`Selected body '${bodyId}' does not exist.`);
    return;
  }

  // ------------------------------------------------------------
  // 2. Required body fields must exist
  // ------------------------------------------------------------
  const required = ["name", "category", "maxWeight", "spaces", "cargoSpaces", "armorCostPerPoint", "armorWeightPerPoint"];

  for (const field of required) {
    if (body[field] === undefined || body[field] === null) {
      messages.errors.push(`Body '${body.name}' is missing required field '${field}'. Check bodies.json.`);
    }
  }

  // ------------------------------------------------------------
  // 3. Body category sanity check
  // ------------------------------------------------------------
  const validCategories = [
    "cycle", "trike", "rev-trike",
    "car", "subcompact", "compact", "midsize", "sedan", "luxury",
    "station-wagon", "pickup", "camper", "van",
    "race", "formula", "can-am", "dragster", "funny-car",
    "boat", "hovercraft", "helicopter"
  ];

  if (!validCategories.includes(body.category)) {
    messages.warnings.push(
      `Body '${body.name}' uses unknown category '${body.category}'. Validation may be incomplete.`
    );
  }

  // ------------------------------------------------------------
  // 4. Body mod existence
  // ------------------------------------------------------------
  if (bodyModId && !bodyMod) {
    messages.errors.push(`Selected body mod '${bodyModId}' does not exist.`);
  }

  // ------------------------------------------------------------
  // 5. Body mod compatibility
  // ------------------------------------------------------------
  if (bodyMod) {
    // Race-only mods
    if (bodyMod.specialRules?.includes("race-only") && body.category !== "race") {
      messages.errors.push(
        `Body mod '${bodyMod.name}' can only be used on race car bodies.`
      );
    }

    // CA Frame rules
    if (bodyMod.specialRules?.includes("ca-frame")) {
      // CA Frame doubles ram damage taken
      messages.info.push(
        `CA Frame: Vehicle will take double damage in rams.`
      );
    }

    // Streamlined rules
    if (bodyMod.specialRules?.includes("streamlined")) {
      messages.info.push(
        `Streamlined body: +10% top speed and +10% MPG.`
      );
    }

    // Sloped rules
    if (bodyMod.specialRules?.includes("sloped")) {
      messages.info.push(
        `Sloped body: -1 to be hit.`
      );
    }
  }

  // ------------------------------------------------------------
  // 6. Max weight validation (body-level)
  // ------------------------------------------------------------
  if (vehicle.weight?.total && body.maxWeight && vehicle.weight.total > body.maxWeight) {
    messages.errors.push(
      `Vehicle weight ${vehicle.weight.total} lbs exceeds base body max weight ${body.maxWeight} lbs.`
    );
  }

  // ------------------------------------------------------------
  // 7. Body spaces validation
  // ------------------------------------------------------------
  if (vehicle.spaces?.total && body.spaces && vehicle.spaces.total > body.spaces) {
    messages.errors.push(
      `Vehicle uses ${vehicle.spaces.total} spaces but body '${body.name}' only provides ${body.spaces}.`
    );
  }

  // ------------------------------------------------------------
  // 8. Cargo space validation
  // ------------------------------------------------------------
  if (vehicle.cargo?.used && body.cargoSpaces && vehicle.cargo.used > body.cargoSpaces) {
    messages.errors.push(
      `Vehicle uses ${vehicle.cargo.used} cargo spaces but body '${body.name}' only provides ${body.cargoSpaces}.`
    );
  }

  // ------------------------------------------------------------
  // 9. Armor cost/weight sanity (Excel rules)
  // ------------------------------------------------------------
  if (body.armorCostPerPoint <= 0 || body.armorWeightPerPoint <= 0) {
    messages.errors.push(
      `Body '${body.name}' has invalid armor cost/weight values.`
    );
  }

  // ------------------------------------------------------------
  // 10. Cycle / Trike / Reverse Trike rules
  // ------------------------------------------------------------
  if (["cycle", "trike", "rev-trike"].includes(body.category)) {
    if (vehicle.wheelCount !== 2 && vehicle.wheelCount !== 3) {
      messages.errors.push(
        `Body '${body.name}' requires 2 or 3 wheels (cycle/trike rules).`
      );
    }
  }

  // ------------------------------------------------------------
  // 11. Race car bodies require racing suspension
  // ------------------------------------------------------------
  if (body.category === "race" || body.category === "formula" || body.category === "can-am") {
    if (vehicle.suspensionId && catalogs.suspension[vehicle.suspensionId]) {
      const susp = catalogs.suspension[vehicle.suspensionId];
      if (!susp.specialRules?.includes("race-only")) {
        messages.errors.push(
          `Body '${body.name}' requires a racing suspension.`
        );
      }
    }
  }

  // ------------------------------------------------------------
  // 12. Boat / Hovercraft / Helicopter bodies (future-proof)
  // ------------------------------------------------------------
  if (["boat", "hovercraft", "helicopter"].includes(body.category)) {
    messages.info.push(
      `Body '${body.name}' is a special vehicle type. Additional rules may apply.`
    );
  }

  // ------------------------------------------------------------
  // 13. Body mod multipliers sanity check
  // ------------------------------------------------------------
  if (bodyMod) {
    const multipliers = [
      "costMultiplier",
      "weightMultiplier",
      "armorCostMultiplier",
      "armorWeightMultiplier"
    ];

    for (const m of multipliers) {
      if (bodyMod[m] !== undefined && bodyMod[m] <= 0) {
        messages.errors.push(
          `Body mod '${bodyMod.name}' has invalid multiplier '${m}' (${bodyMod[m]}).`
        );
      }
    }
  }
}
