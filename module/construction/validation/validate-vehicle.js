//
// validate-vehicle.js
// Master vehicle validator: orchestrates all subsystem validators
//

import { validateBody } from "./validate-body.js";
import { validateChassis } from "./validate-chassis.js";
import { validateSuspension } from "./validate-suspension.js";
import { validateArmor } from "./validate-armor.js";
import { validateWeapons } from "./validate-weapons.js";
import { validateAccessories } from "./validate-accessories.js";
import { validatePowerplant } from "./validate-powerplant.js";
import { validateGasTank } from "./validate-gas-tank.js";
import { validateTires } from "./validate-tires.js";
import { validateSpaces } from "./validate-spaces.js";
import { validateWeight } from "./validate-weight.js";
import { validatePerformance } from "./validate-performance.js";
import { validateInternal } from "./validate-internal.js";
import { validateCrew } from "./validate-crew.js";

/**
 * Run full validation on a vehicle.
 *
 * @param {object} vehicle  Plain JS vehicle system data
 * @param {object} catalogs Loaded data catalogs (bodies, chassis, etc.)
 * @returns {{ errors: string[], warnings: string[], info: string[] }}
 */
export function validateVehicle(vehicle, catalogs) {
  const messages = {
    errors: [],
    warnings: [],
    info: []
  };

  // Order matters for clarity: structure → capacity → payload → dynamics → internal

  // 1. Core structure
  safeCall(() => validateBody(vehicle, catalogs, messages), messages);
  safeCall(() => validateChassis(vehicle, catalogs, messages), messages);
  safeCall(() => validateSuspension(vehicle, catalogs, messages), messages);
  safeCall(() => validateTires(vehicle, catalogs, messages), messages);

  // 2. Power / fuel
  safeCall(() => validatePowerplant(vehicle, catalogs, messages), messages);
  safeCall(() => validateGasTank(vehicle, catalogs, messages), messages);

  // 3. Armor and protection
  safeCall(() => validateArmor(vehicle, catalogs, messages), messages);

  // 4. Payload (weapons, accessories, crew, cargo via weight/spaces)
  safeCall(() => validateWeapons(vehicle, catalogs, messages), messages);
  safeCall(() => validateAccessories(vehicle, catalogs, messages), messages);
  safeCall(() => validateCrew(vehicle, catalogs, messages), messages);

  // 5. Global resource constraints
  safeCall(() => validateSpaces(vehicle, catalogs, messages), messages);
  safeCall(() => validateWeight(vehicle, catalogs, messages), messages);

  // 6. Dynamics / performance
  safeCall(() => validatePerformance(vehicle, catalogs, messages), messages);

  // 7. Internal systems (fire, explosions, component armor, controls)
  safeCall(() => validateInternal(vehicle, catalogs, messages), messages);

  // Optional: de‑duplicate messages if needed
  dedupeMessages(messages);

  return messages;
}

/**
 * Wrap a validator call to prevent one failure from killing the whole run.
 */
function safeCall(fn, messages) {
  try {
    fn();
  } catch (err) {
    messages.errors.push(
      `Internal validation error: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

/**
 * Remove duplicate messages while preserving type and order as much as possible.
 */
function dedupeMessages(messages) {
  messages.errors = Array.from(new Set(messages.errors));
  messages.warnings = Array.from(new Set(messages.warnings));
  messages.info = Array.from(new Set(messages.info));
}
