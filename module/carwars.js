// module/carwars.js

// ------------------------------------------------------------
// IMPORTS
// ------------------------------------------------------------
import { CarWarsActor } from "./actor/base-actor.js";
import { CarWarsVehicleDataModel } from "./actor/vehicle-data.js";
import { CarWarsDriverDataModel } from "./actor/driver-data.js";
import { CarWarsVehicleSheet, CarWarsDriverSheet } from "./actor/actor-sheet.js";
import { PhaseTracker } from "./movement/phase-tracker.js";

// Movement subsystem
import "./movement/maneuver-registry.js";
import "./movement/movement-engine.js";
import "./movement/control-table.js";
import "./movement/templates.js";

// Turning Key system
import "./movement/turningkey-measuredtemplate.js";
import { TurningKeyTemplate } from "./movement/turningkey-template.js";


// ------------------------------------------------------------
// GLOBAL SYSTEM NAMESPACE
// ------------------------------------------------------------
const CarWars = {
  phaseTracker: new PhaseTracker()
};

globalThis.CarWars = CarWars;


// ------------------------------------------------------------
// JSON LOADER (NEW)
// ------------------------------------------------------------
async function loadJSON(path) {
  const response = await fetch(path);
  return await response.json();
}


// ------------------------------------------------------------
// INIT HOOK
// ------------------------------------------------------------
Hooks.once("init", async function () {
  console.log("🔵 [carwars] Init hook fired — starting system initialization");

  console.log("📄 [carwars] carwars.js successfully loaded");

  // ------------------------------------------------------------
  // LOAD RULE DATABASES (NEW)
  // ------------------------------------------------------------
  CONFIG.CARWARS = {};
  CONFIG.CARWARS.bodies = await loadJSON("systems/carwars-system/data/bodies.json");

  console.log("📦 [carwars] Loaded bodies database:", CONFIG.CARWARS.bodies);

  try {
    CONFIG.Actor.documentClass = CarWarsActor;
    console.log("✅ [carwars] Actor class registered:", CONFIG.Actor.documentClass.name);
  } catch (err) {
    console.error("❌ [carwars] Failed to register Actor class:", err);
  }

  try {
    CONFIG.Actor.dataModels = {};
    CONFIG.Actor.dataModels.vehicle = CarWarsVehicleDataModel;
    CONFIG.Actor.dataModels.driver = CarWarsDriverDataModel;
    console.log("✅ [carwars] DataModels registered:", Object.keys(CONFIG.Actor.dataModels));
  } catch (err) {
    console.error("❌ [carwars] Failed to register DataModels:", err);
  }

  try {
    Actors.unregisterSheet("core", ActorSheet);
    console.log("✅ [carwars] Core sheet unregistered");
  } catch (err) {
    console.warn("⚠️ [carwars] Could not unregister core sheet:", err);
  }

  try {
    Actors.registerSheet("carwars", CarWarsVehicleSheet, {
      types: ["vehicle"],
      makeDefault: true
    });

    Actors.registerSheet("carwars", CarWarsDriverSheet, {
      types: ["driver"],
      makeDefault: true
    });

    console.log("✅ [carwars] Custom sheets registered");
  } catch (err) {
    console.error("❌ [carwars] Failed to register custom sheets:", err);
  }

  // ------------------------------------------------------------
  // SYSTEM SETTINGS — SPINOUT ROLL MODE
  // ------------------------------------------------------------
  game.settings.register("carwars", "spinoutRollMode", {
    name: "Spinout Roll Mode",
    hint: "Choose whether spinout rotation is rolled automatically or by the user.",
    scope: "world",
    config: true,
    type: String,
    choices: {
      "auto": "Automatic (system rolls 1d6)",
      "user": "User Roll (player rolls 1d6)"
    },
    default: "user"
  });

  console.log("🔵 [carwars] Init hook complete");
});


// ------------------------------------------------------------
// READY HOOK
// ------------------------------------------------------------
Hooks.once("ready", function () {
  console.log("🟢 [carwars] Ready hook fired — system fully initialized");
});


// ------------------------------------------------------------
// COMBAT ROUND HOOK
// ------------------------------------------------------------
Hooks.on("combatRound", () => {
  console.log("🔄 [carwars] New combat round — resetting movement phases");
  CarWars.phaseTracker.resetPhases();
});


// ------------------------------------------------------------
// TRACK LAST SELECTED TOKEN (Fix for v13 deselection behavior)
// ------------------------------------------------------------
let lastSelectedToken = null;

Hooks.on("controlToken", (token, controlled) => {
  if (controlled) lastSelectedToken = token;
});


// ------------------------------------------------------------
// CANVAS CONTROLS — ADD TURNING KEY BUTTON (v13 portable safe)
// ------------------------------------------------------------
Hooks.on("renderSceneControls", (app, html, data) => {
  const controls = data.controls;

  console.log("🔍 [carwars] Scene controls available:", controls?.map?.(c => c.name));

  if (!controls || !Array.isArray(controls)) return;

  // v13: measurement tools live under "templates"
  const templates = controls.find(c => c.name === "templates");
  if (!templates) {
    console.warn("⚠️ [carwars] Templates controls not found");
    return;
  }

  // tools is an OBJECT in Foundry Portable v13
  if (typeof templates.tools !== "object") {
    console.warn("⚠️ [carwars] templates.tools is not an object:", templates.tools);
    return;
  }

  // Prevent duplicate insertion
  if (templates.tools.turningKey) return;

  // Add our tool as a new key
  templates.tools.turningKey = {
    name: "turningKey",
    title: "Turning Key",
    icon: "fas fa-compass",
    button: true,
    onClick: () => {
      const token = canvas.tokens.controlled[0] || lastSelectedToken;
      if (!token) return ui.notifications.warn("Select a vehicle token first.");
      TurningKeyTemplate.placeInteractive(token, "bend", "left");
    }
  };

  console.log("🧭 [carwars] Turning Key tool added to Templates controls");
});


// ------------------------------------------------------------
// TOKEN HUD — ADD TURNING KEY BUTTON (v12+)
// ------------------------------------------------------------
Hooks.on("renderTokenHUD", (hud, html) => {
  const token = hud.object;

  const btn = $(`<div class="control-icon"><i class="fas fa-compass"></i></div>`);
  btn.attr("title", "Turning Key");

  btn.on("click", () => {
    TurningKeyTemplate.placeInteractive(token, "swerve", "right");
  });

  html.find(".right").append(btn);
});


// ------------------------------------------------------------
// ACTOR SHEET — ADD TURNING KEY BUTTONS
// ------------------------------------------------------------
Hooks.on("renderCarWarsVehicleSheet", (sheet, html) => {
  const bar = $(`<div class="turning-key-bar"></div>`);

  bar.append(`
    <button class="tk-btn" data-maneuver="drift" data-direction="left">
      Drift Left
    </button>
  `);

  bar.append(`
    <button class="tk-btn" data-maneuver="swerve" data-direction="right">
      Swerve Right
    </button>
  `);

  html.find(".sheet-header").append(bar);

  html.find(".tk-btn").on("click", ev => {
    const maneuver = ev.currentTarget.dataset.maneuver;
    const direction = ev.currentTarget.dataset.direction;
    const token = sheet.token;

    if (!token) {
      ui.notifications.warn("This actor is not linked to a token.");
      return;
    }

    TurningKeyTemplate.placeInteractive(token, maneuver, direction);
  });
});
