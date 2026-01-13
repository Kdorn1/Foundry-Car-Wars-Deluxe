/**
 * Engine Rules Loader
 * -------------------
 * Loads engine (powerplant) rules from the system data folder and returns
 * a normalized lookup object keyed by engine type.
 *
 * Example expected JSON structure:
 * {
 *   "powerplants": {
 *     "small-gas":   { ... },
 *     "large-gas":   { ... },
 *     "electric":    { ... },
 *     "supercharger": { ... }
 *   }
 * }
 */

const ENGINE_PATH = "systems/carwars-system/data/powerplants.json";

export async function loadEngineRules() {
  console.group("Car Wars: Loading engine rules");

  try {
    const response = await fetch(ENGINE_PATH);

    if (!response.ok) {
      console.error(`Failed to load engine rules from ${ENGINE_PATH}`);
      console.groupEnd();
      return {};
    }

    const raw = await response.json();

    // Normalize: some JSON files may wrap data in a top-level key
    const data = raw.powerplants || raw;

    if (typeof data !== "object") {
      console.error("Engine rules JSON is not an object", data);
      console.groupEnd();
      return {};
    }

    console.log("Loaded engine rules:", data);
    console.groupEnd();
    return data;

  } catch (err) {
    console.error("Error loading engine rules:", err);
    console.groupEnd();
    return {};
  }
}
