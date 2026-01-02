// module/construction/validation.js

/**
 * Core construction validation for a single vehicle.
 *
 * This module is intentionally pure and decoupled from Foundry.
 * You pass in plain JS data objects; it returns an array of error strings.
 *
 * Later, your Actor logic can adapt Foundry data into this format.
 */

/**
 * @typedef {Object} VehicleInput
 * @property {string} id               - Vehicle ID (optional, for logging)
 * @property {number} totalWeight      - Fully loaded vehicle weight (lbs)
 * @property {number} wheelCount       - Number of wheels actually mounted
 * @property {string} bodyId           - ID of the selected body
 * @property {string} chassisId        - ID of the selected chassis
 * @property {string} bodyModId        - ID of the selected body-mod (optional)
 */

/**
 * @typedef {Object} BodyData
 * @property {string} id
 * @property {string} name
 * @property {string} category         - "cycle" | "car" | "pickup" | "camper" | "van" | etc.
 * @property {number} maxWeight        - Base max weight before chassis/body-mod multipliers
 */

/**
 * @typedef {Object} ChassisData
 * @property {string} id
 * @property {string} name
 * @property {number} costMultiplier
 * @property {number} maxWeightMultiplier
 * @property {string[]} allowedBodyCategories
 * @property {number} [minWheels]
 * @property {number} [maxWheels]
 * @property {number} [requiresSixWheelsOverWeight]
 * @property {string[]} [specialRules]
 */

/**
 * @typedef {Object} BodyModData
 * @property {string} id
 * @property {string} name
 * @property {number} [costMultiplier]
 * @property {number} [weightMultiplier]
 * @property {number} [armorCostMultiplier]
 * @property {number} [armorWeightMultiplier]
 * @property {string[]} [specialRules]
 */

/**
 * @typedef {Object} Catalogs
 * @property {Record<string, BodyData>} bodies
 * @property {Record<string, ChassisData>} chassis
 * @property {Record<string, BodyModData>} bodyMods
 */

/**
 * Validate a vehicle construction and return an array of human-readable error messages.
 *
 * @param {VehicleInput} vehicle
 * @param {Catalogs} catalogs
 * @returns {string[]} errors
 */
export function validateVehicleConstruction(vehicle, catalogs) {
  const errors = [];

  const body = catalogs.bodies[vehicle.bodyId];
  const chassis = catalogs.chassis[vehicle.chassisId];
  const bodyMod = vehicle.bodyModId ? catalogs.bodyMods[vehicle.bodyModId] : null;

  // --- Existence checks -----------------------------------------------------

  if (!body) {
    errors.push(`Selected body '${vehicle.bodyId}' does not exist.`);
    return errors;
  }

  if (!chassis) {
    errors.push(`Selected chassis '${vehicle.chassisId}' does not exist.`);
    return errors;
  }

  // --- Rule 1: Body category must be allowed by chassis ---------------------

  if (Array.isArray(chassis.allowedBodyCategories) && chassis.allowedBodyCategories.length > 0) {
    if (!chassis.allowedBodyCategories.includes(body.category)) {
      errors.push(
        `Chassis '${chassis.name}' cannot be used with body type '${body.category}'.`
      );
    }
  }

  // --- Rule 2: Wheel count must be within chassis limits --------------------

  if (typeof chassis.minWheels === "number" && vehicle.wheelCount < chassis.minWheels) {
    errors.push(
      `Chassis '${chassis.name}' requires at least ${chassis.minWheels} wheels (current: ${vehicle.wheelCount}).`
    );
  }

  if (typeof chassis.maxWheels === "number" && vehicle.wheelCount > chassis.maxWheels) {
    errors.push(
      `Chassis '${chassis.name}' allows at most ${chassis.maxWheels} wheels (current: ${vehicle.wheelCount}).`
    );
  }

  // --- Rule 3: Max weight based on body + chassis --------------------------

  const chassisMaxWeight = body.maxWeight * (chassis.maxWeightMultiplier ?? 1.0);

  if (vehicle.totalWeight > chassisMaxWeight) {
    errors.push(
      `Vehicle weight ${vehicle.totalWeight} lbs exceeds maximum for body '${body.name}' with chassis '${chassis.name}' (${chassisMaxWeight} lbs).`
    );
  }

  // --- Rule 4: Extra-heavy requirement for very heavy vehicles -------------

  if (
    typeof chassis.requiresSixWheelsOverWeight === "number" &&
    vehicle.totalWeight > chassis.requiresSixWheelsOverWeight &&
    chassis.id !== "extra-heavy"
  ) {
    errors.push(
      `Vehicles over ${chassis.requiresSixWheelsOverWeight} lbs must use an Extra-Heavy chassis.`
    );
  }

  // --- Rule 5: Special case for pickups/vans/campers over 5500 lbs ---------

  if (
    (body.category === "pickup" || body.category === "van" || body.category === "camper") &&
    vehicle.totalWeight > 5500 &&
    chassis.id !== "extra-heavy"
  ) {
    errors.push(
      `Pickups, vans, and campers over 5500 lbs must use an Extra-Heavy chassis.`
    );
  }

  // --- Future: Body-mod-specific rules (placeholder) ------------------------

  // Example hook:
  // if (bodyMod) { ...additional validations here... }

  return errors;
}
