/**
 * Armor Rules Loader
 * ------------------
 * Loads armor rules from the system data folder and returns
 * a normalized lookup object keyed by armor type.
 *
 * Example expected JSON structure:
 * {
 *   "armor": {
 *     "plastic":     { ... },
 *     "metal":       { ... },
 *     "fireproof":   { ... },
 *     "laserReflect": { ... }
 *   }
 * }
 */

const ARMOR_PATH = "systems/carwars-system/data/armor.json";

export async function loadArmorRules() {
  console.group("Car Wars: Loading armor rules");

  try {
    const response = await fetch(ARMOR_PATH);

    if (!response.ok) {
      console.error(`Failed to load armor rules from ${ARMOR_PATH}`);
      console.groupEnd();
      return {};
    }

    const raw = await response.json();

    // Normalize: some JSON files may wrap data in a top-level key
    const data = raw.armor || raw;

    if (typeof data !== "object") {
      console.error("Armor rules JSON is not an object", data);
      console.groupEnd();
      return {};
    }

    console.log("Loaded armor rules:", data);
    console.groupEnd();
    return data;

  } catch (err) {
    console.error("Error loading armor rules:", err);
    console.groupEnd();
    return {};
  }
}
