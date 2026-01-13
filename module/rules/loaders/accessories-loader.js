/**
 * Accessories Rules Loader
 * ------------------------
 * Loads accessory rules from the system data folder and returns
 * a normalized lookup object keyed by accessory ID.
 */

const ACCESSORIES_PATH = "systems/carwars-system/data/accessories.json";

export async function loadAccessoryRules() {
  console.group("Car Wars: Loading accessory rules");

  try {
    const response = await fetch(ACCESSORIES_PATH);

    if (!response.ok) {
      console.error(`Failed to load accessory rules from ${ACCESSORIES_PATH}`);
      console.groupEnd();
      return {};
    }

    const raw = await response.json();

    const list = raw.accessories;
    if (!Array.isArray(list)) {
      console.error("Accessory rules JSON is not an array", list);
      console.groupEnd();
      return {};
    }

    const flat = {};

    for (const acc of list) {
      if (!acc.id) continue;
      flat[acc.id] = acc;
    }

    console.log("Loaded accessory rules (flattened):", flat);
    console.groupEnd();
    return flat;

  } catch (err) {
    console.error("Error loading accessory rules:", err);
    console.groupEnd();
    return {};
  }
}
