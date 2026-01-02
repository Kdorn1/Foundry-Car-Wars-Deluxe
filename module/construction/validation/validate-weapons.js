//
// validate-weapons.js
// Full validation for WEAPONS, AMMO, MOUNTS, TURRETS, CUPOLAS, EWPs, LINKS
//

export function validateWeapons(vehicle, catalogs, messages) {
  const weapons = vehicle.weapons ?? [];
  const body = catalogs.bodies[vehicle.bodyId];

  // ------------------------------------------------------------
  // 1. No weapons? That's allowed.
  // ------------------------------------------------------------
  if (weapons.length === 0) {
    messages.info.push(`Vehicle has no weapons installed.`);
    return;
  }

  // ------------------------------------------------------------
  // 2. Validate each weapon entry
  // ------------------------------------------------------------
  for (const w of weapons) {
    const item = catalogs.weapons[w.itemId];

    if (!item) {
      messages.errors.push(`Weapon '${w.itemId}' does not exist.`);
      continue;
    }

    // ------------------------------------------------------------
    // 3. Required weapon fields
    // ------------------------------------------------------------
    const required = ["name", "spaces", "weight", "cost", "ammoType", "maxAmmo"];

    for (const field of required) {
      if (item[field] === undefined || item[field] === null) {
        messages.errors.push(
          `Weapon '${item.name}' is missing required field '${field}'. Check weapons.json.`
        );
      }
    }

    // ------------------------------------------------------------
    // 4. Mount legality
    // ------------------------------------------------------------
    if (!validateMount(w, item, vehicle, catalogs, messages)) {
      continue; // mount invalid, skip deeper checks
    }

    // ------------------------------------------------------------
    // 5. Ammo validation
    // ------------------------------------------------------------
    validateAmmo(w, item, messages);

    // ------------------------------------------------------------
    // 6. Linked weapon rules
    // ------------------------------------------------------------
    if (w.linkedTo) {
      validateLinkedWeapons(w, weapons, catalogs, messages);
    }

    // ------------------------------------------------------------
    // 7. Concealed weapon rules
    // ------------------------------------------------------------
    if (w.concealed) {
      validateConcealment(w, item, messages);
    }

    // ------------------------------------------------------------
    // 8. Waterproofed weapon rules
    // ------------------------------------------------------------
    if (w.waterproofed) {
      messages.info.push(
        `Weapon '${item.name}' is waterproofed (+25% cost).`
      );
    }

    // ------------------------------------------------------------
    // 9. Pintle mount rules
    // ------------------------------------------------------------
    if (w.mount === "pintle") {
      validatePintleMount(w, item, body, messages);
    }

    // ------------------------------------------------------------
    // 10. Rocket platform rules
    // ------------------------------------------------------------
    if (w.mount === "rocket-platform") {
      validateRocketPlatform(w, item, body, messages);
    }

    // ------------------------------------------------------------
    // 11. Laser guidance link rules
    // ------------------------------------------------------------
    if (w.laserGuided) {
      validateLaserGuidance(w, item, messages);
    }

    // ------------------------------------------------------------
    // 12. DP sanity
    // ------------------------------------------------------------
    if (item.dp <= 0) {
      messages.errors.push(
        `Weapon '${item.name}' has invalid DP value '${item.dp}'.`
      );
    }
  }

  // ------------------------------------------------------------
  // 13. Weapon count limits (cycles/trikes)
  // ------------------------------------------------------------
  validateWeaponCountLimits(vehicle, catalogs, messages);
}

//
// ---------------------------------------------------------------------------
// Helper Functions (Option 1 — All helpers live at the bottom of this file)
// ---------------------------------------------------------------------------
//

function validateMount(w, item, vehicle, catalogs, messages) {
  const mount = w.mount;

  if (!mount) {
    messages.errors.push(
      `Weapon '${item.name}' has no mount specified.`
    );
    return false;
  }

  // Turret / Cupola mounts
  if (mount.startsWith("turret") || mount.startsWith("cupola")) {
    return validateTurretMount(w, item, vehicle, catalogs, messages);
  }

  // External Weapon Pod
  if (mount === "ewp") {
    return validateEWP(w, item, messages);
  }

  // Rocket platform
  if (mount === "rocket-platform") {
    return true; // deeper rules handled elsewhere
  }

  // Pintle
  if (mount === "pintle") {
    return true;
  }

  // Standard body mounts
  const valid = ["front", "back", "left", "right", "top", "under"];

  if (!valid.includes(mount)) {
    messages.errors.push(
      `Weapon '${item.name}' uses invalid mount '${mount}'.`
    );
    return false;
  }

  return true;
}

function validateTurretMount(w, item, vehicle, catalogs, messages) {
  const turret = vehicle.turrets?.[w.mount];

  if (!turret) {
    messages.errors.push(
      `Weapon '${item.name}' is mounted in '${w.mount}' but no such turret exists on the vehicle.`
    );
    return false;
  }

  const available = turret.weaponSpaces ?? 0;

  if (item.spaces > available) {
    messages.errors.push(
      `Weapon '${item.name}' requires ${item.spaces} spaces but turret '${w.mount}' only provides ${available}.`
    );
    return false;
  }

  return true;
}

function validateEWP(w, item, messages) {
  if (item.spaces > 4) {
    messages.errors.push(
      `Weapon '${item.name}' cannot be mounted in an External Weapon Pod (max 4 spaces).`
    );
    return false;
  }

  return true;
}

function validateAmmo(w, item, messages) {
  const ammo = w.ammo ?? 0;

  if (ammo < 0) {
    messages.errors.push(
      `Weapon '${item.name}' cannot have negative ammo.`
    );
  }

  if (ammo > item.maxAmmo) {
    messages.errors.push(
      `Weapon '${item.name}' exceeds max ammo (${ammo} > ${item.maxAmmo}).`
    );
  }
}

function validateLinkedWeapons(w, weapons, catalogs, messages) {
  const target = weapons.find(x => x.id === w.linkedTo);

  if (!target) {
    messages.errors.push(
      `Weapon '${w.itemId}' is linked to non-existent weapon '${w.linkedTo}'.`
    );
    return;
  }

  const itemA = catalogs.weapons[w.itemId];
  const itemB = catalogs.weapons[target.itemId];

  if (itemA.ammoType !== itemB.ammoType) {
    messages.errors.push(
      `Linked weapons '${itemA.name}' and '${itemB.name}' must use the same ammo type.`
    );
  }
}

function validateConcealment(w, item, messages) {
  if (item.spaces > 2) {
    messages.errors.push(
      `Weapon '${item.name}' is too large to conceal (max 2 spaces).`
    );
  }
}

function validatePintleMount(w, item, body, messages) {
  if (body.category === "cycle") {
    messages.errors.push(
      `Pintle mounts cannot be used on cycles.`
    );
  }
}

function validateRocketPlatform(w, item, body, messages) {
  if (!item.ammoType?.includes("rocket")) {
    messages.errors.push(
      `Rocket platforms may only mount rocket weapons.`
    );
  }
}

function validateLaserGuidance(w, item, messages) {
  if (!item.ammoType?.includes("rocket")) {
    messages.errors.push(
      `Laser guidance links only apply to rocket weapons.`
    );
  }
}

function validateWeaponCountLimits(vehicle, catalogs, messages) {
  const body = catalogs.bodies[vehicle.bodyId];
  const weapons = vehicle.weapons ?? [];

  if (!body) return;

  if (body.category === "cycle" && weapons.length > 2) {
    messages.errors.push(
      `Cycles may mount at most 2 weapons.`
    );
  }

  if (body.category === "trike" && weapons.length > 3) {
    messages.errors.push(
      `Trikes may mount at most 3 weapons.`
    );
  }
}
