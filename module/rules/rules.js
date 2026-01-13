/**
 * Unified Rules Registry
 * ----------------------
 * Loads all rule data from JSON files and exposes a centralized
 * lookup object for use throughout the system.
 */

import { loadBodyRules } from "./loaders/body-loader.js";
import { loadChassisRules } from "./loaders/chassis-loader.js";
import { loadSuspensionRules } from "./loaders/suspension-loader.js";
import { loadPowerplantRules } from "./loaders/engine-loader.js";
import { loadGasTankRules } from "./loaders/gas-tank-loader.js";
import { loadTireRules } from "./loaders/tires-loader.js";
import { loadAccessoryRules } from "./loaders/accessories-loader.js";
import { loadWeaponRules } from "./loaders/weapons-loader.js";
import { loadArmorRules } from "./loaders/armor-loader.js";
import { loadEngineModRules } from "./loaders/engine-mods-loader.js";
import { loadTireOptionRules } from "./loaders/tire-options-loader.js";

// Central registry object — populated during system startup
export const RulesRegistry = {
  bodies:      {},
  chassis:     {},
  suspensions: {},
  powerplants: {},
  gasTanks:    {},
  tires:       {},
  accessories: {},
  weapons:     {},
  armor:       {},
  engineMods:  {},
  tireOptions: {}
};

// Async loader — call this during system ready
export async function loadAllRules() {
  console.group("Car Wars: Loading all rules");

  try {
    RulesRegistry.bodies      = await loadBodyRules();
    RulesRegistry.chassis     = await loadChassisRules();
    RulesRegistry.suspensions = await loadSuspensionRules();
    RulesRegistry.powerplants = await loadPowerplantRules();
    RulesRegistry.gasTanks    = await loadGasTankRules();
    RulesRegistry.tires       = await loadTireRules();
    RulesRegistry.accessories = await loadAccessoryRules();
    RulesRegistry.weapons     = await loadWeaponRules();
    RulesRegistry.armor       = await loadArmorRules();
    RulesRegistry.engineMods  = await loadEngineModRules();
    RulesRegistry.tireOptions = await loadTireOptionRules();

    console.log("Car Wars rules loaded:", RulesRegistry);

  } catch (err) {
    console.error("Error loading Car Wars rules:", err);
  }

  console.groupEnd();
  return RulesRegistry;
}
