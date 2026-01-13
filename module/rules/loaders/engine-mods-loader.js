/**
 * Engine Mods Rules Loader
 * ------------------------
 * Loads engine modification rules from the system data folder and returns
 * a normalized lookup object keyed by mod type.
 *
 * Example expected JSON structure:
 * {
 *   "engineMods": {
 *     "supercharger": { ... },
 *     "turbocharger": { ... },
 *     "hdTransmission": { ... }
 *   }
 * }
 */

const ENGINE_MODS_PATH = "systems/carwars-system/data/engine-mods.json";

export async function loadEngineModRules() {
  console.group("Car Wars: Loading engine modification rules");

  try {
    const response = await fetch(ENGINE_MODS_PATH);

    if (!response.ok) {
      console.error(`Failed to load engine mod rules from ${ENGINE_MODS_PATH}`);
      console.groupEnd();
      return {};
    }

    const raw = await response.json();

    // Normalize: some JSON files may wrap data in a top-level key
    const data = raw.engineMods || raw;

    if (typeof data !== "object") {
      console.error("Engine mod rules JSON is not an object", data);
      console.groupEnd();
      return {};
    }

    console.log("Loaded engine mod rules:", data);
    console.groupEnd();
    return data;

  } catch (err) {
    console.error("Error loading engine mod rules:", err);
    console.groupEnd();
    return {};
  }
}
