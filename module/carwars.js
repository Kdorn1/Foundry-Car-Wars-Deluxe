// ------------------------------------------------------------
// Static imports (namespace imports to allow robust fallback handling)
// ------------------------------------------------------------
import * as BaseActorModule from "./actor/base-actor.js";
import * as VehicleDataModule from "./actor/vehicle-data.js";
import * as DriverDataModule from "./actor/driver-data.js";
import * as RegisterSheetsModule from "./actor/register-sheets.js";
import * as ActorSheetModule from "./actor/actor-sheet.js";

import * as PhaseTrackerModule from "./movement/phase-tracker.js";
import "./movement/maneuver-registry.js";
import "./movement/movement-engine.js";
import "./movement/control-table.js";
import "./movement/templates.js";
import "./movement/turningkey-measuredtemplate.js";
import * as TurningKeyModule from "./movement/turningkey-template.js";

import * as MovementUIModule from "./ui/movement/movement-phase-service.js";

// ------------------------------------------------------------
// Force log (moved after imports so the ES module remains valid)
// ------------------------------------------------------------
console.log("🟪 [carwars FORCE LOG] carwars.js top-of-file executed", { href: window.location?.href });

// ------------------------------------------------------------
// Resolve exports with safe fallbacks
// ------------------------------------------------------------
const CarWarsActor = BaseActorModule.CarWarsActor ?? BaseActorModule.default ?? BaseActorModule;
const CarWarsVehicleDataModel = VehicleDataModule.CarWarsVehicleDataModel ?? VehicleDataModule.default ?? VehicleDataModule;
const CarWarsDriverDataModel = DriverDataModule.CarWarsDriverDataModel ?? DriverDataModule.default ?? DriverDataModule;
const registerActorSheets = RegisterSheetsModule.registerActorSheets ?? RegisterSheetsModule.default ?? RegisterSheetsModule;

const PhaseTracker = PhaseTrackerModule.PhaseTracker ?? PhaseTrackerModule.default ?? PhaseTrackerModule;
const TurningKeyTemplate = TurningKeyModule.TurningKeyTemplate ?? TurningKeyModule.default ?? TurningKeyModule;
const MovementUI = MovementUIModule ?? MovementUIModule.default ?? MovementUIModule;

// ------------------------------------------------------------
// STARTUP CHECK — guaranteed log to prove the module executed
// ------------------------------------------------------------
console.log("🟦 [carwars] STARTUP CHECK - carwars.js loaded from:", window.location.origin + "/systems/carwars-system/module/carwars.js");

// ------------------------------------------------------------
// LOGGING UTIL
// ------------------------------------------------------------
function log(msg, ...args) {
  const ts = new Date().toISOString().split("T")[1].replace("Z", "");
  console.log(`🟦 [carwars ${ts}] ${msg}`, ...args);
}

function warn(msg, ...args) {
  const ts = new Date().toISOString().split("T")[1].replace("Z", "");
  console.warn(`🟨 [carwars ${ts}] ${msg}`, ...args);
}

function error(msg, ...args) {
  const ts = new Date().toISOString().split("T")[1].replace("Z", "");
  console.error(`🟥 [carwars ${ts}] ${msg}`, ...args);
}

// ------------------------------------------------------------
// BEGIN MODULE EXECUTION
// ------------------------------------------------------------
log("Importing subsystem modules…");
log("All imports completed.");

// ------------------------------------------------------------
// GLOBAL SYSTEM NAMESPACE
// ------------------------------------------------------------
log("Initializing global CarWars namespace…");

let _phaseTrackerInstance = null;
try {
  if (typeof PhaseTracker === "function") {
    _phaseTrackerInstance = new PhaseTracker();
  } else if (PhaseTracker && typeof PhaseTracker.create === "function") {
    _phaseTrackerInstance = PhaseTracker.create();
  } else {
    warn("PhaseTracker export is not a constructor; using stub:", PhaseTracker);
  }
} catch (e) {
  error("PhaseTracker construction failed:", e);
}

const CarWars = {
  phaseTracker: _phaseTrackerInstance || {
    resetPhases: () => warn("Using stub phaseTracker.resetPhases()")
  }
};

globalThis.CarWars = CarWars;

log("Global CarWars namespace initialized:", CarWars);

// ------------------------------------------------------------
// JSON LOADER
// ------------------------------------------------------------
async function loadJSON(path) {
  log(`Loading JSON: ${path}`);
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`);
  const data = await response.json();
  log(`Loaded JSON: ${path}`, data);
  return data;
}

// ------------------------------------------------------------
// INIT HOOK
// ------------------------------------------------------------
Hooks.once("init", async function () {
  log("INIT hook fired — beginning system initialization");

  // ------------------------------------------------------------
  // Register Handlebars helpers
  // ------------------------------------------------------------
  Handlebars.registerHelper("range", function(start, end, options) {
    const arr = [];
    for (let i = start; i <= end; i++) arr.push(i);

    // Subexpression or inline usage: (range 1 6)
    if (!options || typeof options.fn !== "function") {
      return arr;
    }

    // Block usage: {{#range 1 6}}...{{/range}}
    let out = "";
    for (let i = start; i <= end; i++) {
      out += options.fn(i);
    }
    return out;
  });

  // ------------------------------------------------------------
  // Load JSON Data
  // ------------------------------------------------------------
  CONFIG.CARWARS = {};
  try {
    CONFIG.CARWARS.bodies = await loadJSON("systems/carwars-system/data/bodies.json");
    log("bodies.json loaded.");
  } catch (e) {
    error("Failed to load bodies.json:", e);
    CONFIG.CARWARS.bodies = {};
  }

  // ------------------------------------------------------------
  // Register Actor Class
  // ------------------------------------------------------------
  try {
    CONFIG.Actor.documentClass = CarWarsActor;
    log("Actor class registered:", CONFIG.Actor.documentClass?.name ?? "(unknown)");
  } catch (err) {
    error("Failed to register Actor class:", err);
  }

  // ------------------------------------------------------------
  // Register Data Models
  // ------------------------------------------------------------
  try {
    CONFIG.Actor.dataModels = {
      vehicle: CarWarsVehicleDataModel,
      driver: CarWarsDriverDataModel
    };
    log("DataModels registered:", Object.keys(CONFIG.Actor.dataModels));
  } catch (err) {
    error("Failed to register DataModels:", err);
  }

  // ------------------------------------------------------------
  // Register Settings
  // ------------------------------------------------------------
  try {
    game.settings.register("carwars", "spinoutRollMode", {
      name: "Spinout Roll Mode",
      hint: "Choose whether spinout rotation is rolled automatically or by the user.",
      scope: "world",
      config: true,
      type: String,
      choices: {
        auto: "Automatic (system rolls 1d6)",
        user: "User Roll (player rolls 1d6)"
      },
      default: "user"
    });
    log("Settings registered.");
  } catch (e) {
    error("Failed to register settings:", e);
  }

  // ------------------------------------------------------------
  // Defensive save hook: coerce system.crew to an array on actor updates
  // ------------------------------------------------------------
  // This ensures future saves cannot persist a legacy object-shaped crew.
  Hooks.on("preUpdateActor", (actor, update, options, userId) => {
    const crew = update?.system?.crew;
    if (crew && !Array.isArray(crew)) {
      update.system = update.system ?? {};
      update.system.crew = Array.isArray(crew) ? crew : [];
      // Only log for GMs to reduce noise for players
      if (game.user?.isGM) console.warn("carwars | coerced crew to array on save for actor:", actor.name);
    }
  });

  // ------------------------------------------------------------
  // Preload Handlebars templates early (init)
  // ------------------------------------------------------------
  try {
    const LT = foundry?.applications?.handlebars?.loadTemplates;
    if (typeof LT === "function") {
      await LT([
        "systems/carwars-system/templates/actor/vehicle-sheet.html",
        "systems/carwars-system/templates/actor/driver-sheet.html",
        "systems/carwars-system/templates/actor/partials/crew-role.html",
        "systems/carwars-system/templates/actor/partials/validation-panel.html",
        "systems/carwars-system/templates/actor/partials/armor-panel.html",
        "systems/carwars-system/templates/actor/partials/crew-panel.html",
        "systems/carwars-system/templates/actor/partials/systems-panel.html",
        "systems/carwars-system/templates/actor/partials/construction-panel.html",
        "systems/carwars-system/templates/actor/partials/hazard-display.html",
        "systems/carwars-system/templates/actor/partials/speed-control.html",
        "systems/carwars-system/templates/actor/partials/hc-tracker.html",
        "systems/carwars-system/templates/actor/partials/weapon-panel.html",
        "systems/carwars-system/templates/actor/partials/weapon-summary.html",
        "systems/carwars-system/templates/actor/partials/movement-panel.html"
      ]);
      log("Templates preloaded at init via foundry.applications.handlebars.loadTemplates.");
    } else {
      // Fallback: defer to canvasReady if loadTemplates is not available at init
      Hooks.once("canvasReady", async () => {
        const LT2 = foundry?.applications?.handlebars?.loadTemplates;
        if (typeof LT2 === "function") {
          await LT2([
            "systems/carwars-system/templates/actor/vehicle-sheet.html",
            "systems/carwars-system/templates/actor/driver-sheet.html",
            "systems/carwars-system/templates/actor/partials/crew-role.html",
            "systems/carwars-system/templates/actor/partials/validation-panel.html",
            "systems/carwars-system/templates/actor/partials/armor-panel.html",
            "systems/carwars-system/templates/actor/partials/crew-panel.html",
            "systems/carwars-system/templates/actor/partials/systems-panel.html",
            "systems/carwars-system/templates/actor/partials/construction-panel.html",
            "systems/carwars-system/templates/actor/partials/hazard-display.html",
            "systems/carwars-system/templates/actor/partials/speed-control.html",
            "systems/carwars-system/templates/actor/partials/hc-tracker.html",
            "systems/carwars-system/templates/actor/partials/weapon-panel.html",
            "systems/carwars-system/templates/actor/partials/weapon-summary.html",
            "systems/carwars-system/templates/actor/partials/movement-panel.html"
          ]);
          log("Templates preloaded at canvasReady as fallback.");
        } else {
          warn("Template preloading unavailable at init and canvasReady.");
        }
      });
    }
  } catch (e) {
    error("Template preloading failed:", e);
  }

  log("INIT hook complete.");
});

// ------------------------------------------------------------
// SETUP HOOK — REGISTER SHEETS (v13 API)
// ------------------------------------------------------------
Hooks.once("setup", function () {
  log("SETUP hook fired — registering sheets…");

  try {
    if (typeof registerActorSheets === "function") {
      registerActorSheets();
      log("Custom sheets registered successfully.");
    } else {
      warn("registerActorSheets is not a function:", registerActorSheets);
    }
  } catch (err) {
    error("Failed to register custom sheets:", err);
  }
});


// ------------------------------------------------------------
// READY HOOK
// ------------------------------------------------------------
Hooks.once("ready", function () {
  log("READY hook fired — system fully initialized");

  game.carwars = {
    ui: {
      movement: MovementUI
    },
    // Expose a manual migration helper for GMs to run once
    migrateCrew: async function migrateCrew() {
      const actors = game.actors.contents;
      for (const actor of actors) {
        const raw = actor.system?.crew;
        if (raw && !Array.isArray(raw)) {
          console.warn("carwars | Migrating crew for actor:", actor.name);
          const arr = [];
          if (raw.driver) arr.push({ uuid: raw.driver.uuid ?? null, role: "driver", ...raw.driver });
          if (raw.gunner) arr.push({ uuid: raw.gunner.uuid ?? null, role: "gunner", ...raw.gunner });
          if (Array.isArray(raw.occupants)) raw.occupants.forEach(o => arr.push({ uuid: o.uuid ?? null, role: "passenger", ...o }));
          const normalized = arr.filter(Boolean).map(e => ({ role: e.role ?? "passenger", uuid: e.uuid ?? null, ...e }));
          try {
            await actor.update({ "system.crew": normalized });
            console.log(`carwars | Migrated ${actor.name}`, normalized);
          } catch (err) {
            console.error(`carwars | Failed to migrate ${actor.name}`, err);
          }
        }
      }
      ui.notifications?.info("carwars | Crew migration complete.");
    }
  };

  log("Phase 5 UI API exposed:", game.carwars.ui);
});

// ------------------------------------------------------------
// COMBAT ROUND HOOK
// ------------------------------------------------------------
Hooks.on("combatRound", () => {
  log("Combat round advanced — resetting movement phases");
  try {
    CarWars.phaseTracker.resetPhases();
  } catch (e) {
    error("phaseTracker.resetPhases() failed:", e);
  }
});

// ------------------------------------------------------------
// TRACK LAST SELECTED TOKEN
// ------------------------------------------------------------
let lastSelectedToken = null;

Hooks.on("controlToken", (token, controlled) => {
  log("controlToken fired:", { token, controlled });
  if (controlled) lastSelectedToken = token;
});

// ------------------------------------------------------------
// CANVAS CONTROLS — ADD TURNING KEY BUTTON
// ------------------------------------------------------------
Hooks.on("renderSceneControls", (app, html, data) => {
  log("renderSceneControls fired. Controls:", data.controls?.map?.(c => c.name));

  const controls = data.controls;
  if (!controls) return warn("No controls array found.");

  const templates = controls.find(c => c.name === "templates");
  if (!templates) return warn("Templates controls not found.");

  if (templates.tools?.turningKey) {
    log("Turning Key tool already exists — skipping.");
    return;
  }

  log("Adding Turning Key tool to scene controls…");

  templates.tools = templates.tools || {};
  templates.tools.turningKey = {
    name: "turningKey",
    title: "Turning Key",
    icon: "fas fa-compass",
    button: true,
    onClick: () => {
      log("Turning Key button clicked.");
      const token = canvas.tokens.controlled[0] || lastSelectedToken;
      if (!token) return ui.notifications.warn("Select a vehicle token first.");
      try {
        TurningKeyTemplate.placeInteractive(token, "bend", "left");
      } catch (e) {
        error("TurningKeyTemplate.placeInteractive failed:", e);
      }
    }
  };
});

// ------------------------------------------------------------
// TOKEN HUD — ADD TURNING KEY BUTTON
// ------------------------------------------------------------
Hooks.on("renderTokenHUD", (hud, html) => {
  log("renderTokenHUD fired for token:", hud.object);

  const btn = $(`<div class="control-icon"><i class="fas fa-compass"></i></div>`);
  btn.attr("title", "Turning Key");

  btn.on("click", () => {
    log("Turning Key HUD button clicked.");
    try {
      TurningKeyTemplate.placeInteractive(hud.object, "swerve", "right");
    } catch (e) {
      error("TurningKeyTemplate.placeInteractive failed:", e);
    }
  });

  html.find(".right").append(btn);
});

// ------------------------------------------------------------
// ACTOR SHEET — ADD TURNING KEY BUTTONS
// ------------------------------------------------------------
Hooks.on("renderCarWarsVehicleSheet", (sheet, html) => {
  log("renderCarWarsVehicleSheet fired for actor:", sheet.actor);

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

    log("Turning Key sheet button clicked:", { maneuver, direction });

    const token = sheet.token;
    if (!token) {
      warn("No token linked to actor.");
      return ui.notifications.warn("This actor is not linked to a token.");
    }

    try {
      TurningKeyTemplate.placeInteractive(token, maneuver, direction);
    } catch (e) {
      error("TurningKeyTemplate.placeInteractive failed:", e);
    }
  });
});
