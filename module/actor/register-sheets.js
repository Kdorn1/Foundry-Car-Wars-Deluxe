// module/actor/register-sheets.js
// Modern sheet registration for Car Wars (Foundry V12+)

import { CarWarsVehicleSheet, CarWarsDriverSheet } from "../actor/actor-sheet.js";
import { CarWarsItemSheet } from "../item/carwars-item-sheet.js";

export function registerActorSheets() {
  console.log("🟦 [carwars] registerActorSheets() called.");

  // Use the actual system ID from system.json: "carwars-system"
  const SYSTEM_ID = "carwars-system";

  // ------------------------------------------------------------
  // Actor Sheets (preferred V12 API)
  // ------------------------------------------------------------
  Actors.registerSheet(SYSTEM_ID, CarWarsVehicleSheet, {
    types: ["vehicle"],
    label: "Car Wars Vehicle Sheet",
    makeDefault: true
  });

  Actors.registerSheet(SYSTEM_ID, CarWarsDriverSheet, {
    types: ["driver"],
    label: "Car Wars Driver Sheet",
    makeDefault: true
  });

  // ------------------------------------------------------------
  // Item Sheets
  // ------------------------------------------------------------
  Items.registerSheet(SYSTEM_ID, CarWarsItemSheet, {
    // Adjust "base" if your actual item types differ
    types: ["base"],
    label: "Car Wars Item Sheet",
    makeDefault: true
  });
}
