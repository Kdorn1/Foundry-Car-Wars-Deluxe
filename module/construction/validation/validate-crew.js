//
// validate-crew.js
// Full validation for CREW, POSITIONS, CONTROLS, WEIGHT, SPACE, BODY RULES
//

export function validateCrew(vehicle, catalogs, messages) {
  const body = catalogs.bodies[vehicle.bodyId];
  const crew = vehicle.crew ?? {};

  if (!body) {
    messages.errors.push(`Cannot validate crew: body '${vehicle.bodyId}' does not exist.`);
    return;
  }

  // ------------------------------------------------------------
  // 1. Driver is mandatory
  // ------------------------------------------------------------
  if (!crew.driver) {
    messages.errors.push(`Vehicle must have a driver.`);
    return; // cannot validate further without a driver
  }

  // ------------------------------------------------------------
  // 2. Driver fields sanity
  // ------------------------------------------------------------
  validateCrewMember("driver", crew.driver, messages);

  // ------------------------------------------------------------
  // 3. Gunner (optional but must be valid if present)
  // ------------------------------------------------------------
  if (crew.gunner) {
    validateCrewMember("gunner", crew.gunner, messages);
  }

  // ------------------------------------------------------------
  // 4. Body-specific crew rules
  // ------------------------------------------------------------
  validateCrewBodyRestrictions(body, crew, messages);

  // ------------------------------------------------------------
  // 5. Controls must exist
  // ------------------------------------------------------------
  if (!vehicle.internal?.controls) {
    messages.errors.push(`Vehicle must have driver controls.`);
  }

  // ------------------------------------------------------------
  // 6. Crew space usage
  // ------------------------------------------------------------
  const usedCrewSpaces = computeCrewSpaces(crew);
  const availableCrewSpaces = body.crewSpaces ?? 0;

  if (usedCrewSpaces > availableCrewSpaces) {
    messages.errors.push(
      `Crew uses ${usedCrewSpaces} spaces but body '${body.name}' only provides ${availableCrewSpaces}.`
    );
  }

  // ------------------------------------------------------------
  // 7. Ejection seat rules
  // ------------------------------------------------------------
  validateEjectionSeats(vehicle, crew, messages);

  // ------------------------------------------------------------
  // 8. Fire rules (crew interaction)
  // ------------------------------------------------------------
  validateCrewFireRules(vehicle, crew, messages);

  // ------------------------------------------------------------
  // 9. Informational summary
  // ------------------------------------------------------------
  messages.info.push(
    `Crew validated: driver + ${crew.gunner ? "gunner" : "no gunner"} (${usedCrewSpaces}/${availableCrewSpaces} spaces).`
  );
}

//
// ---------------------------------------------------------------------------
// Helper Functions (Option 1 — All helpers live at the bottom of this file)
// ---------------------------------------------------------------------------
//

function validateCrewMember(role, member, messages) {
  if (!member) {
    messages.errors.push(`Crew role '${role}' is missing.`);
    return;
  }

  if (member.weight <= 0) {
    messages.errors.push(
      `Crew member '${role}' must have weight > 0.`
    );
  }

  if (!member.name || member.name.trim().length === 0) {
    messages.warnings.push(
      `Crew member '${role}' has no name.`
    );
  }

  if (member.armor && member.armor < 0) {
    messages.errors.push(
      `Crew member '${role}' cannot have negative armor.`
    );
  }
}

function validateCrewBodyRestrictions(body, crew, messages) {
  switch (body.category) {
    case "cycle":
      if (crew.gunner) {
        messages.errors.push(`Cycles cannot have gunners.`);
      }
      break;

    case "trike":
    case "rev-trike":
      // RAW: trikes may have a gunner only if seat exists
      if (crew.gunner && !(body.crewSpaces >= 2)) {
        messages.errors.push(
          `Trikes require a second crew space to carry a gunner.`
        );
      }
      break;

    case "race":
    case "formula":
    case "dragster":
      if (crew.gunner) {
        messages.errors.push(
          `Race cars cannot have gunners.`
        );
      }
      break;

    default:
      // Cars, vans, pickups, etc. have no special crew restrictions
      break;
  }
}

function computeCrewSpaces(crew) {
  let spaces = 0;

  if (crew.driver) spaces += 1;
  if (crew.gunner) spaces += 1;

  return spaces;
}

function validateEjectionSeats(vehicle, crew, messages) {
  const accessories = vehicle.accessories ?? [];
  const hasEjectionSeat = accessories.some(a => a.itemId === "ejection-seat");

  if (hasEjectionSeat && !crew.driver) {
    messages.errors.push(
      `Ejection seat installed but no driver present.`
    );
  }

  if (hasEjectionSeat) {
    messages.info.push(
      `Ejection seat installed: driver can eject on crash table results.`
    );
  }
}

function validateCrewFireRules(vehicle, crew, messages) {
  const accessories = vehicle.accessories ?? [];
  const hasFE = accessories.some(a => a.itemId === "fire-extinguisher");
  const hasIFE = accessories.some(a => a.itemId === "improved-fire-extinguisher");

  if (!hasFE && !hasIFE) {
    messages.warnings.push(
      `Crew has no fire suppression — fire cannot be controlled.`
    );
  }

  if (crew.driver?.armor <= 0) {
    messages.warnings.push(
      `Driver has no personal armor — high risk in fire or breach.`
    );
  }
}
