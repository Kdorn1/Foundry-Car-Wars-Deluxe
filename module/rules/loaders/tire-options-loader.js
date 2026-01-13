/**
 * Tire Options Rules Loader
 * -------------------------
 * Loads tire option rules from the system data folder and returns
 * a normalized lookup object keyed by option type.
 */

const TIRE_OPTIONS_PATH = "systems/carwars-system/data/tire-options.json";

export async function loadTireOptionsRules() {
  console.group("Car Wars: Loading tire options rules");

  try {
    const response = await fetch(TIRE_OPTIONS_PATH);

    if (!response.ok) {
      console.error(`Failed to load tire options rules from ${TIRE_OPTIONS_PATH}`);
      console.groupEnd();
      return {};
    }

    const raw = await response.json();

    // Normalize: some JSON files may wrap data in a top-level key
    const data = raw.tireOptions || raw;

    if (typeof data !== "object") {
      console.error("Tire options rules JSON is not an object", data);
      console.groupEnd();
      return {};
    }

    console.log("Loaded tire options rules:", data);
    console.groupEnd();
    return data;

  } catch (err) {
    console.error("Error loading tire options rules:", err);
    console.groupEnd();
    return {};
  }
}
