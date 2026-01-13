/**
 * Rules Index (Rules Registry + Orchestrator)
 * -------------------------------------------
 * Loads ALL rule JSON via the loader modules and exposes a unified
 * registry for use by sheets, item creation, validation, and UI.
 *
 * This file is the single source of truth for all rule data.
 */

// Loaders
import { loadAccessoryRules }   from "./loaders/accessories-loader.js";
import { loadArmorRules }       from "./loaders/armor-loader.js";
import { loadBodyRules }        from "./loaders/body-loader.js";
import { loadChassisRules }     from "./loaders/chassis-loader.js";
import { loadEngineRules }      from "./loaders/engine-loader.js";          // ⭐ FIXED
import { loadEngineModRules }   from "./loaders/engine-mods-loader.js";
import { loadGasTankRules }     from "./loaders/gas-tank-loader.js";
import { loadSuspensionRules }  from "./loaders/suspension-loader.js";
import { loadTireOptionsRules } from "./loaders/tire-options-loader.js";    // ⭐ FIXED
import { loadTireRules }        from "./loaders/tires-loader.js";
import { loadWeaponRules }      from "./loaders/weapons-loader.js";

export const RulesIndex = {
  accessories:   {},
  armor:         {},
  bodies:        {},
  chassis:       {},
  engines:       {},   // ⭐ FIXED naming
  engineMods:    {},
  gasTanks:      {},
  suspension:    {},
  tireOptions:   {},
  tires:         {},
  weapons:       {},

  /**
   * Load all rule data in parallel.
   * This should be called ONCE during system initialization.
   */
  async loadAllRules() {
    console.group("Car Wars: Loading ALL rules");

    try {
      const [
        accessories,
        armor,
        bodies,
        chassis,
        engines,        // ⭐ FIXED
        engineMods,
        gasTanks,
        suspension,
        tireOptions,
        tires,
        weapons
      ] = await Promise.all([
        loadAccessoryRules(),
        loadArmorRules(),
        loadBodyRules(),
        loadChassisRules(),
        loadEngineRules(),        // ⭐ FIXED
        loadEngineModRules(),
        loadGasTankRules(),
        loadSuspensionRules(),
        loadTireOptionsRules(),   // ⭐ FIXED
        loadTireRules(),
        loadWeaponRules()
      ]);

      // Store results
      this.accessories   = accessories   || {};
      this.armor         = armor         || {};
      this.bodies        = bodies        || {};
      this.chassis       = chassis       || {};
      this.engines       = engines       || {};     // ⭐ FIXED
      this.engineMods    = engineMods    || {};
      this.gasTanks      = gasTanks      || {};
      this.suspension    = suspension    || {};
      this.tireOptions   = tireOptions   || {};
      this.tires         = tires         || {};
      this.weapons       = weapons       || {};

      console.log("Car Wars: All rules loaded successfully", this);

    } catch (err) {
      console.error("Car Wars: Error loading rules", err);
    }

    console.groupEnd();
  },

  /**
   * Simple getter for any rule category.
   * Example: RulesIndex.get("weapons")
   */
  get(category) {
    return this[category] || {};
  }
};
