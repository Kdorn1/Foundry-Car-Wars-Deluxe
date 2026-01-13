/**
 * Chassis Rules Loader
 * --------------------
 * Loads chassis rules from the system data folder and returns
 * a normalized lookup object keyed by chassis type.
 *
 * Example expected JSON structure:
 * {
 *   "chassis": {
 *     "light": { ... },
 *     "standard": { ... },
 *     "heavy": { ... }
 *   }
 * }
 */

const CHASSIS_PATH = "systems/carwars-system/data/chassis.json";

export async function loadChassisRules() {
  console.group("Car Wars: Loading chassis rules");

  try {
    const response = await fetch(CHASSIS_PATH);

    if (!response.ok) {
      console.error(`Failed to load chassis rules from ${CHASSIS_PATH}`);
      console.groupEnd();
      return {};
    }

    const raw = await response.json();

    // Normalize: some JSON files may wrap data in a top-level key
    const data = raw.chassis || raw;

    if (typeof data !== "object") {
      console.error("Chassis rules JSON is not an object", data);
      console.groupEnd();
      return {};
    }

    console.log("Loaded chassis rules:", data);
    console.groupEnd();
    return data;

  } catch (err) {
    console.error("Error loading chassis rules:", err);
    console.groupEnd();
    return {};
  }
}
