//
// index.js
// Orchestrator for the modular validation system.
// Each validator populates messages.errors, messages.warnings, messages.info.
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
import { validateCrew } from "./validate-crew.js";
import { validateInternal } from "./validate-internal.js";

/**
 * Run all validators and return a unified message object.
 *
 * @param {object} vehicle - The vehicle actor.system data
 * @param {object} catalogs - Loaded JSON catalogs
 * @returns {{errors: string[], warnings: string[], info: string[]}}
 */
export function validateVehicle(vehicle, catalogs) {
  const messages = {
    errors: [],
    warnings: [],
    info: []
  };

  // Structural
  validateBody(vehicle, catalogs, messages);
  validateChassis(vehicle, catalogs, messages);
  validateSuspension(vehicle, catalogs, messages);
  validateTires(vehicle, catalogs, messages);

  // Power / fuel
  validatePowerplant(vehicle, catalogs, messages);
  validateGasTank(vehicle, catalogs, messages);

  // Protection
  validateArmor(vehicle, catalogs, messages);

  // Payload
  validateWeapons(vehicle, catalogs, messages);
  validateAccessories(vehicle, catalogs, messages);
  validateCrew(vehicle, catalogs, messages);

  // Global constraints
  validateSpaces(vehicle, catalogs, messages);
  validateWeight(vehicle, catalogs, messages);

  // Dynamics
  validatePerformance(vehicle, catalogs, messages);

  // Internal systems
  validateInternal(vehicle, catalogs, messages);

  return messages;
}
