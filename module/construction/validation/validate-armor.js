//
// validate-armor.js
// Full validation for ARMOR, COMPONENT ARMOR, WHEELGUARDS, WHEELHUBS, RAMPLATE
//

export function validateArmor(vehicle, catalogs, messages) {
  const armorType = vehicle.armor?.type;
  const armorCatalog = catalogs.armor[armorType];
  const body = catalogs.bodies[vehicle.bodyId];
  const bodyMod = vehicle.bodyModId ? catalogs.bodyMods[vehicle.bodyModId] : null;

  // ------------------------------------------------------------
  // 1. Armor type must exist
  // ------------------------------------------------------------
  if (!armorCatalog) {
    messages.errors.push(`Armor type '${armorType}' does not exist.`);
    return;
  }

  // ------------------------------------------------------------
  // 2. Required armor fields
  // ------------------------------------------------------------
  const required = ["costPerPoint", "weightPerPoint", "dpPerPoint"];

  for (const field of required) {
    if (armorCatalog[field] === undefined || armorCatalog[field] === null) {
      messages.errors.push(
        `Armor type '${armorType}' is missing required field '${field}'. Check armor.json.`
      );
    }
  }

  // ------------------------------------------------------------
  // 3. Main armor facings must be valid numbers
  // ------------------------------------------------------------
  const facings = ["front", "back", "left", "right", "top", "under"];

  for (const facing of facings) {
    const pts = vehicle.armor[facing];

    if (pts < 0) {
      messages.errors.push(
        `Armor points for ${facing} cannot be negative.`
      );
    }

    if (!Number.isFinite(pts)) {
      messages.errors.push(
        `Armor points for ${facing} must be a number.`
      );
    }
  }

  // ------------------------------------------------------------
  // 4. Total armor points sanity (Excel rule)
  // ------------------------------------------------------------
  const totalArmorPoints = facings.reduce((sum, f) => sum + (vehicle.armor[f] ?? 0), 0);

  if (totalArmorPoints <= 0) {
    messages.warnings.push(
      `Vehicle has no armor assigned.`
    );
  }

  // ------------------------------------------------------------
  // 5. Body armor cost/weight multipliers (Excel)
  // ------------------------------------------------------------
  let costMultiplier = 1;
  let weightMultiplier = 1;

  if (bodyMod) {
    if (bodyMod.armorCostMultiplier) costMultiplier *= bodyMod.armorCostMultiplier;
    if (bodyMod.armorWeightMultiplier) weightMultiplier *= bodyMod.armorWeightMultiplier;
  }

  // ------------------------------------------------------------
  // 6. Armor cost/weight sanity
  // ------------------------------------------------------------
  if (armorCatalog.costPerPoint * costMultiplier <= 0) {
    messages.errors.push(
      `Armor type '${armorType}' has invalid cost-per-point after multipliers.`
    );
  }

  if (armorCatalog.weightPerPoint * weightMultiplier <= 0) {
    messages.errors.push(
      `Armor type '${armorType}' has invalid weight-per-point after multipliers.`
    );
  }

  // ------------------------------------------------------------
  // 7. Component Armor rules
  // ------------------------------------------------------------
  const compArmor = vehicle.armor.componentArmor ?? [];

  for (const comp of compArmor) {
    const pts = comp.points ?? 0;
    const spaces = comp.spaces ?? 0;

    if (spaces <= 0) {
      messages.errors.push(
        `Component armor entry '${comp.location}' must specify spaces > 0.`
      );
      continue;
    }

    const maxWeight = 20 * spaces; // RAW: max 20 lbs per component space
    const weight = pts * armorCatalog.weightPerPoint * weightMultiplier;

    if (weight > maxWeight) {
      messages.errors.push(
        `Component armor '${comp.location}' exceeds max weight (${weight} lbs > ${maxWeight} lbs).`
      );
    }

    // Composite armor rule
    if (armorType === "composite") {
      if (!comp.baseArmorType) {
        messages.errors.push(
          `Component armor '${comp.location}' using composite must specify baseArmorType.`
        );
      }
    }
  }

  // ------------------------------------------------------------
  // 8. Wheelguards & Wheelhubs rules
  // ------------------------------------------------------------
  const wheelguards = vehicle.armor.wheelguards ?? [];
  const wheelhubs = vehicle.armor.wheelhubs ?? [];

  const wheelCount = vehicle.wheelCount ?? 0;

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

    // Must match armor type (Excel rule)
    if (armorType !== "composite" && wg > 0) {
      messages.info.push(
        `Wheelguards must match armor type '${armorType}'.`
      );
    }
  }

  // ------------------------------------------------------------
  // 9. Ramplate rules
  // ------------------------------------------------------------
  if (vehicle.armor.ramplate?.has) {
    const frontPts = vehicle.armor.front ?? 0;

    if (frontPts <= 0) {
      messages.errors.push(
        `Ramplate requires at least 1 point of front armor.`
      );
    }

    // Bumper spikes conflict
    if (vehicle.accessories?.some(a => a.itemId === "bumper-spikes")) {
      messages.errors.push(
        `Bumper spikes cannot be used on the front with a ramplate.`
      );
    }
  }

  // ------------------------------------------------------------
  // 10. Sloped armor rules (Excel)
  // ------------------------------------------------------------
  if (bodyMod?.specialRules?.includes("sloped")) {
    messages.info.push(
      `Sloped armor: -1 to be hit.`
    );
  }

  // ------------------------------------------------------------
  // 11. Composite armor rules
  // ------------------------------------------------------------
  if (armorType === "composite") {
    messages.info.push(
      `Composite armor: cost/weight based on plastic underneath.`
    );
  }

  // ------------------------------------------------------------
  // 12. DP sanity check
  // ------------------------------------------------------------
  const dpPerPoint = armorCatalog.dpPerPoint ?? 1;

  for (const facing of facings) {
    const pts = vehicle.armor[facing] ?? 0;
    const dp = pts * dpPerPoint;

    if (dp < 0) {
      messages.errors.push(
        `DP for ${facing} armor is negative (${dp}).`
      );
    }
  }
}
