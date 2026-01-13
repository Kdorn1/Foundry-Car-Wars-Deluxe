/**
 * Gas Tank Rules Loader
 * ---------------------
 * Loads gas tank rules from the system data folder and returns
 * a normalized lookup object keyed by tank type.
 *
 * Example expected JSON structure:
 * {
 *   "gasTanks": {
 *     "1-gallon": { ... },
 *     "5-gallon": { ... },
 *     "10-gallon": { ... }
 *   }
 * }
 */

const GAS_TANKS_PATH = "systems/carwars-system/data/gas-tanks.json";

export async function loadGasTankRules() {
  console.group("Car Wars: Loading gas tank rules");

  try {
    const response = await fetch(GAS_TANKS_PATH);

    if (!response.ok) {
      console.error(`Failed to load gas tank rules from ${GAS_TANKS_PATH}`);
      console.groupEnd();
      return {};
    }

    const raw = await response.json();

    // Normalize: some JSON files may wrap data in a top-level key
    const data = raw.gasTanks || raw;

    if (typeof data !== "object") {
      console.error("Gas tank rules JSON is not an object", data);
      console.groupEnd();
      return {};
    }

    console.log("Loaded gas tank rules:", data);
    console.groupEnd();
    return data;

  } catch (err) {
    console.error("Error loading gas tank rules:", err);
    console.groupEnd();
    return {};
  }
}
