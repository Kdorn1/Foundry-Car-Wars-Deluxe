// module/actor/register-sheets.js
// Registers custom actor sheets for Car Wars system

import { CarWarsVehicleSheet, CarWarsDriverSheet } from "./actor-sheet.js";

/**
 * Register all custom actor sheets for the Car Wars system.
 */
export function registerActorSheets() {
  try {
    // Prefer the global Actors collection when available, otherwise fall back to the v13-specific alias
    const ActorsCollection = globalThis.Actors ?? foundry?.documents?.collections?.Actors ?? null;
    const CoreActorSheet = globalThis.ActorSheet ?? foundry?.appv1?.sheets?.ActorSheet ?? null;

    if (!ActorsCollection) {
      console.warn("🟨 [carwars] Actors collection not found; skipping sheet registration.");
      return;
    }

    // Attempt to unregister the core sheet if present (defensive)
    try {
      if (CoreActorSheet && typeof ActorsCollection.unregisterSheet === "function") {
        ActorsCollection.unregisterSheet("core", CoreActorSheet);
        console.log("🟦 [carwars] Unregistered core ActorSheet.");
      }
    } catch (e) {
      console.warn("🟨 [carwars] Could not unregister core sheet (continuing):", e);
    }

    // Register vehicle sheet
    try {
      if (typeof ActorsCollection.registerSheet === "function") {
        ActorsCollection.registerSheet("carwars-system", CarWarsVehicleSheet, {
          label: "CarWars Vehicle Sheet",
          types: ["vehicle"],
          makeDefault: true
        });
        console.log("🟦 [carwars] Registered CarWarsVehicleSheet for type: vehicle");
      } else {
        console.warn("🟨 [carwars] ActorsCollection.registerSheet is not a function; vehicle sheet not registered.");
      }
    } catch (e) {
      console.error("🟥 [carwars] Failed to register vehicle sheet:", e);
    }

    // Register driver sheet
    try {
      if (typeof ActorsCollection.registerSheet === "function") {
        ActorsCollection.registerSheet("carwars-system", CarWarsDriverSheet, {
          label: "CarWars Driver Sheet",
          types: ["driver"],
          makeDefault: true
        });
        console.log("🟦 [carwars] Registered CarWarsDriverSheet for type: driver");
      }
    } catch (e) {
      console.error("🟥 [carwars] Failed to register driver sheet:", e);
    }

  } catch (err) {
    console.error("🟥 [carwars] registerActorSheets() failed:", err);
  }
}
