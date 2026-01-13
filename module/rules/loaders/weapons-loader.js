/**
 * Weapons Rules Loader
 * --------------------
 * Loads weapon rules from the system data folder and returns
 * a normalized lookup object keyed by weapon ID.
 */

const WEAPONS_PATH = "systems/carwars-system/data/weapons.json";

export async function loadWeaponRules() {
  console.group("Car Wars: Loading weapon rules");

  try {
    const response = await fetch(WEAPONS_PATH);

    if (!response.ok) {
      console.error(`Failed to load weapon rules from ${WEAPONS_PATH}`);
      console.groupEnd();
      return {};
    }

    const raw = await response.json();

    const categories = raw.weapons;
    if (typeof categories !== "object") {
      console.error("Weapon rules JSON is not an object", categories);
      console.groupEnd();
      return {};
    }

    const flat = {};

    // Flatten category arrays into a single lookup table
    for (const [category, list] of Object.entries(categories)) {
      if (!Array.isArray(list)) continue;

      for (const weapon of list) {
        if (!weapon.id) continue;

        flat[weapon.id] = {
          ...weapon,
          category
        };
      }
    }

    console.log("Loaded weapon rules (flattened):", flat);
    console.groupEnd();
    return flat;

  } catch (err) {
    console.error("Error loading weapon rules:", err);
    console.groupEnd();
    return {};
  }
}
