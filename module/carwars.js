// module/carwars.js
// Car Wars System Spine — Foundry VTT v12+

import { registerActorSheets } from "./actor/register-sheets.js";
import { registerHandlebarsHelpers } from "./handlebars-helpers.js";
import { loadPartials } from "./helpers/template-loader.js";

import { CarWarsActor } from "./actor/base-actor.js";
import { CarWarsVehicleDataModel } from "./actor/vehicle-data.js";
import { CarWarsDriverDataModel } from "./actor/driver-data.js";

import { validateVehicleConstruction } from "./construction/validation.js";
import { applyRules } from "./rules/rule-engine.js";

import { initializeMovementEngine } from "./movement/index.js";

console.log("🟦 [carwars] Loading Car Wars System Spine…");

Hooks.once("init", async function () {
  console.log("🟦 [carwars] INIT — Registering system components");

  // ------------------------------------------------------------
  // Register Actor Data Models
  // ------------------------------------------------------------
  CONFIG.Actor.dataModels["vehicle"] = CarWarsVehicleDataModel;
  CONFIG.Actor.dataModels["driver"] = CarWarsDriverDataModel;

  // ------------------------------------------------------------
  // Register Actor Class
  // ------------------------------------------------------------
  CONFIG.Actor.documentClass = CarWarsActor;

  // ------------------------------------------------------------
  // Register Handlebars Helpers
  // ------------------------------------------------------------
  registerHandlebarsHelpers();

  // ------------------------------------------------------------
  // Load Template Partials BEFORE sheet registration
  // ------------------------------------------------------------
  await loadPartials();

  // ------------------------------------------------------------
  // Register Sheets
  // ------------------------------------------------------------
  registerActorSheets();

  console.log("🟦 [carwars] INIT complete.");
});

Hooks.once("ready", async function () {
  console.log("🟦 [carwars] READY — System fully loaded.");

  initializeMovementEngine?.();

  console.log("🟦 [carwars] Car Wars system READY.");
});

// ------------------------------------------------------------
// Actor + Item Lifecycle Hooks
// ------------------------------------------------------------

Hooks.on("updateActor", (actor) => {
  try {
    applyRules(actor);

    if (actor.type === "vehicle") {
      validateVehicleConstruction(actor);
    }
  } catch (err) {
    console.error("❌ [carwars] Actor update error:", err);
  }
});

Hooks.on("createItem", (item) => {
  const actor = item.actor;
  if (actor?.type === "vehicle") {
    try {
      validateVehicleConstruction(actor);
    } catch (err) {
      console.error("❌ [carwars] Item validation error:", err);
    }
  }
});
