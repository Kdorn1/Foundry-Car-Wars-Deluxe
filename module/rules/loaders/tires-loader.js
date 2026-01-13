/* Auto-generated placeholder for tires-loader.js */
/**
 * Tire Rules Loader
 * -----------------
 * Loads tire rules from the system data folder and returns
 * a normalized lookup object keyed by tire type.
 *
 * Example expected JSON structure:
 * {
 *   "tires": {
 *     "standard":   { ... },
 *     "heavyDuty":  { ... },
 *     "solid":      { ... },
 *     "pneumatic":  { ... }
 *   }
 * }
 */

const TIRES_PATH = "systems/carwars-system/data/tires.json";

export async function loadTireRules() {
  console.group("Car Wars: Loading tire rules");

  try {
    const response = await fetch(TIRES_PATH);

    if (!response.ok) {
      console.error(`Failed to load tire rules from ${TIRES_PATH}`);
      console.groupEnd();
      return {};
    }

    const raw = await response.json();

    // Normalize: some JSON files may wrap data in a top-level key
    const data = raw.tires || raw;

    if (typeof data !== "object") {
      console.error("Tire rules JSON is not an object", data);
      console.groupEnd();
      return {};
    }

    console.log("Loaded tire rules:", data);
    console.groupEnd();
    return data;

  } catch (err) {
    console.error("Error loading tire rules:", err);
    console.groupEnd();
    return {};
  }
}
