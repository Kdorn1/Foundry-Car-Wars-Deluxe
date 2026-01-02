//
// validate-accessories.js
// Full validation for ACCESSORIES, SPECIAL RULES, SPACE/WEIGHT/COST SANITY
//

export function validateAccessories(vehicle, catalogs, messages) {
  const accessories = vehicle.accessories ?? [];
  const body = catalogs.bodies[vehicle.bodyId];

  if (!body) {
    messages.errors.push(`Cannot validate accessories: body '${vehicle.bodyId}' does not exist.`);
    return;
  }

  // ------------------------------------------------------------
  // 1. No accessories? That's allowed.
  // ------------------------------------------------------------
  if (accessories.length === 0) {
    messages.info.push(`Vehicle has no accessories installed.`);
    return;
  }

  // ------------------------------------------------------------
  // 2. Validate each accessory entry
  // ------------------------------------------------------------
  for (const acc of accessories) {
    const item = catalogs.accessories[acc.itemId];

    if (!item) {
      messages.errors.push(`Accessory '${acc.itemId}' does not exist.`);
      continue;
    }

    // ------------------------------------------------------------
    // 3. Required fields
    // ------------------------------------------------------------
    const required = ["name", "spaces", "weight", "cost", "dp"];

    for (const field of required) {
      if (item[field] === undefined || item[field] === null) {
        messages.errors.push(
          `Accessory '${item.name}' is missing required field '${field}'. Check accessories.json.`
        );
      }
    }

    // ------------------------------------------------------------
    // 4. Space validation
    // ------------------------------------------------------------
    if (!validateAccessorySpaces(acc, item, vehicle, messages)) continue;

    // ------------------------------------------------------------
    // 5. Weight sanity
    // ------------------------------------------------------------
    if (item.weight < 0) {
      messages.errors.push(
        `Accessory '${item.name}' has invalid weight '${item.weight}'.`
      );
    }

    // ------------------------------------------------------------
    // 6. DP sanity
    // ------------------------------------------------------------
    if (item.dp < 0) {
      messages.errors.push(
        `Accessory '${item.name}' has invalid DP '${item.dp}'.`
      );
    }

    // ------------------------------------------------------------
    // 7. Body restrictions
    // ------------------------------------------------------------
    validateAccessoryBodyRestrictions(acc, item, body, messages);

    // ------------------------------------------------------------
    // 8. Quantity limits
    // ------------------------------------------------------------
    validateAccessoryQuantity(acc, item, accessories, messages);

    // ------------------------------------------------------------
    // 9. Special accessory rules
    // ------------------------------------------------------------
    validateSpecialAccessoryRules(acc, item, vehicle, messages);
  }
}

//
// ---------------------------------------------------------------------------
// Helper Functions (Option 1 — All helpers live at the bottom of this file)
// ---------------------------------------------------------------------------
//

function validateAccessorySpaces(acc, item, vehicle, messages) {
  const used = item.spaces ?? 0;
  const total = vehicle.spaces?.total ?? 0;

  if (used < 0) {
    messages.errors.push(
      `Accessory '${item.name}' cannot use negative spaces.`
    );
    return false;
  }

  if (used > total) {
    messages.errors.push(
      `Accessory '${item.name}' uses ${used} spaces but vehicle only has ${total}.`
    );
    return false;
  }

  return true;
}

function validateAccessoryBodyRestrictions(acc, item, body, messages) {
  if (!item.allowedBodyCategories) return;

  if (!item.allowedBodyCategories.includes(body.category)) {
    messages.errors.push(
      `Accessory '${item.name}' cannot be installed on body type '${body.category}'.`
    );
  }
}

function validateAccessoryQuantity(acc, item, accessories, messages) {
  if (!item.maxQuantity) return;

  const count = accessories.filter(a => a.itemId === acc.itemId).length;

  if (count > item.maxQuantity) {
    messages.errors.push(
      `Accessory '${item.name}' exceeds max quantity (${count} > ${item.maxQuantity}).`
    );
  }
}

function validateSpecialAccessoryRules(acc, item, vehicle, messages) {
  const name = item.name.toLowerCase();

  // ------------------------------------------------------------
  // Spoilers & Airdams
  // ------------------------------------------------------------
  if (name.includes("spoiler") || name.includes("airdam")) {
    messages.info.push(
      `Spoilers/Airdams: HC +1; if both installed, maneuvers at 60+ are D -1.`
    );
  }

  // ------------------------------------------------------------
  // Roll Cage
  // ------------------------------------------------------------
  if (name.includes("roll cage")) {
    messages.info.push(
      `Roll Cage: weight = 1 point of metal armor × number of facings.`
    );
  }

  // ------------------------------------------------------------
  // Fire Extinguisher
  // ------------------------------------------------------------
  if (name.includes("fire extinguisher")) {
    messages.info.push(
      `Fire Extinguisher: required for fire suppression; IFE improves odds.`
    );
  }

  // ------------------------------------------------------------
  // Computer Gunner / Targeting Computer
  // ------------------------------------------------------------
  if (name.includes("computer gunner")) {
    messages.info.push(
      `Computer Gunner: +1 to hit for all linked weapons.`
    );
  }

  if (name.includes("targeting computer")) {
    messages.info.push(
      `Targeting Computer: +1 to hit for one position.`
    );
  }

  // ------------------------------------------------------------
  // NBC
  // ------------------------------------------------------------
  if (name.includes("nbc")) {
    messages.info.push(
      `NBC Shielding: protects crew from gas/smoke/chemical attacks.`
    );
  }

  // ------------------------------------------------------------
  // Stealth
  // ------------------------------------------------------------
  if (name.includes("stealth")) {
    messages.info.push(
      `Stealth: reduces detection range; cost/weight vary by vehicle type.`
    );
  }

  // ------------------------------------------------------------
  // Jump Jets
  // ------------------------------------------------------------
  if (name.includes("jump jet")) {
    messages.info.push(
      `Jump Jets: cost $75 per 10 lbs; 1 space & 1 DP per 100 lbs.`
    );
  }

  // ------------------------------------------------------------
  // Rocket Boosters
  // ------------------------------------------------------------
  if (name.includes("rocket booster")) {
    messages.info.push(
      `Rocket Boosters: $50 per 10 lbs; 1 space & 1 DP per 100 lbs.`
    );
  }

  // ------------------------------------------------------------
  // Cargo Carriers
  // ------------------------------------------------------------
  if (name.includes("car top carrier")) {
    messages.info.push(
      `Car Top Carrier: adds cargo space; armor cost/weight vary by size.`
    );
  }

  // ------------------------------------------------------------
  // External Weapon Pods
  // ------------------------------------------------------------
  if (name.includes("external weapon pod")) {
    messages.info.push(
      `External Weapon Pod: limited to 1–4 space weapons; adds weight.`
    );
  }

  // ------------------------------------------------------------
  // Component Armor (Accessory version)
  // ------------------------------------------------------------
  if (name.includes("component armor")) {
    messages.info.push(
      `Component Armor: max 20 lbs per space; cost/weight vary by armor type.`
    );
  }

  // ------------------------------------------------------------
  // Wheelguards / Hubs (Accessory version)
  // ------------------------------------------------------------
  if (name.includes("wheelguard") || name.includes("wheel hub")) {
    messages.info.push(
      `Wheelguards/Hubs: must match armor type; max 40 lbs per wheel.`
    );
  }
}
