//
// validate-chassis.js
// Full validation for CHASSIS rules
//

export function validateChassis(vehicle, catalogs, messages) {
  const chassisId = vehicle.chassisId;
  const bodyId = vehicle.bodyId;

  const chassis = catalogs.chassis[chassisId];
  const body = catalogs.bodies[bodyId];

  // ------------------------------------------------------------
  // 1. Chassis must exist
  // ------------------------------------------------------------
  if (!chassis) {
    messages.errors.push(`Selected chassis '${chassisId}' does not exist.`);
    return;
  }

  // ------------------------------------------------------------
  // 2. Required chassis fields
  // ------------------------------------------------------------
  const required = [
    "name",
    "maxWeightMultiplier",
    "costMultiplier",
    "allowedBodyCategories"
  ];

  for (const field of required) {
    if (chassis[field] === undefined || chassis[field] === null) {
      messages.errors.push(
        `Chassis '${chassis.name}' is missing required field '${field}'. Check chassis.json.`
      );
    }
  }

  // ------------------------------------------------------------
  // 3. Body must exist for compatibility checks
  // ------------------------------------------------------------
  if (!body) {
    messages.errors.push(
      `Chassis '${chassis.name}' cannot be validated because body '${bodyId}' does not exist.`
    );
    return;
  }

  // ------------------------------------------------------------
  // 4. Body category must be allowed by chassis
  // ------------------------------------------------------------
  if (Array.isArray(chassis.allowedBodyCategories) &&
      chassis.allowedBodyCategories.length > 0) {

    if (!chassis.allowedBodyCategories.includes(body.category)) {
      messages.errors.push(
        `Chassis '${chassis.name}' cannot be used with body type '${body.category}'.`
      );
    }
  }

  // ------------------------------------------------------------
  // 5. Wheel count limits
  // ------------------------------------------------------------
  const wheels = vehicle.wheelCount ?? 0;

  if (typeof chassis.minWheels === "number" && wheels < chassis.minWheels) {
    messages.errors.push(
      `Chassis '${chassis.name}' requires at least ${chassis.minWheels} wheels (current: ${wheels}).`
    );
  }

  if (typeof chassis.maxWheels === "number" && wheels > chassis.maxWheels) {
    messages.errors.push(
      `Chassis '${chassis.name}' allows at most ${chassis.maxWheels} wheels (current: ${wheels}).`
    );
  }

  // ------------------------------------------------------------
  // 6. Max weight calculation (Excel + RAW)
  // ------------------------------------------------------------
  const baseMax = body.maxWeight ?? 0;
  const chassisMax = baseMax * (chassis.maxWeightMultiplier ?? 1.0);

  if (vehicle.weight?.total && vehicle.weight.total > chassisMax) {
    messages.errors.push(
      `Vehicle weight ${vehicle.weight.total} lbs exceeds maximum for body '${body.name}' with chassis '${chassis.name}' (${chassisMax} lbs).`
    );
  }

  // ------------------------------------------------------------
  // 7. Extra-heavy chassis requirement (Excel rule)
  // ------------------------------------------------------------
  if (typeof chassis.requiresSixWheelsOverWeight === "number") {
    if (vehicle.weight?.total > chassis.requiresSixWheelsOverWeight &&
        chassis.id !== "extra-heavy") {
      messages.errors.push(
        `Vehicles over ${chassis.requiresSixWheelsOverWeight} lbs must use an Extra-Heavy chassis.`
      );
    }
  }

  // ------------------------------------------------------------
  // 8. Pickup/Van/Camper special rule (Excel)
  // ------------------------------------------------------------
  if (
    ["pickup", "van", "camper"].includes(body.category) &&
    vehicle.weight?.total > 5500 &&
    chassis.id !== "extra-heavy"
  ) {
    messages.errors.push(
      `Pickups, vans, and campers over 5500 lbs must use an Extra-Heavy chassis.`
    );
  }

  // ------------------------------------------------------------
  // 9. Race car chassis restrictions
  // ------------------------------------------------------------
  if (["race", "formula", "can-am", "dragster", "funny-car"].includes(body.category)) {
    if (!chassis.specialRules?.includes("race-only")) {
      messages.errors.push(
        `Body '${body.name}' requires a racing chassis.`
      );
    }
  }

  // ------------------------------------------------------------
  // 10. Chassis special rules (informational)
  // ------------------------------------------------------------
  if (Array.isArray(chassis.specialRules)) {
    for (const rule of chassis.specialRules) {
      switch (rule) {
        case "double-ram-damage":
          messages.info.push(
            `Chassis '${chassis.name}' takes double damage in rams.`
          );
          break;

        case "off-road":
          messages.info.push(
            `Chassis '${chassis.name}' provides off-road capability.`
          );
          break;

        case "race-only":
          messages.info.push(
            `Chassis '${chassis.name}' is a racing chassis.`
          );
          break;

        default:
          messages.warnings.push(
            `Chassis '${chassis.name}' has unknown special rule '${rule}'.`
          );
      }
    }
  }

  // ------------------------------------------------------------
  // 11. Sanity checks for multipliers
  // ------------------------------------------------------------
  const multipliers = [
    "maxWeightMultiplier",
    "costMultiplier"
  ];

  for (const m of multipliers) {
    if (chassis[m] !== undefined && chassis[m] <= 0) {
      messages.errors.push(
        `Chassis '${chassis.name}' has invalid multiplier '${m}' (${chassis[m]}).`
      );
    }
  }
}
