/**
 * Body Rules Loader
 * -----------------
 * Loads body rules from the system data folder and returns
 * a normalized lookup object keyed by body ID.
 */

const BODIES_PATH = "systems/carwars-system/data/bodies.json";

export async function loadBodyRules() {
  console.group("Car Wars: Loading body rules");

  try {
    const response = await fetch(BODIES_PATH);

    if (!response.ok) {
      console.error(`Failed to load body rules from ${BODIES_PATH}`);
      console.groupEnd();
      return {};
    }

    const raw = await response.json();

    const categories = raw.bodies;
    if (typeof categories !== "object") {
      console.error("Body rules JSON is not an object", categories);
      console.groupEnd();
      return {};
    }

    const flat = {};

    // Flatten category arrays into a single lookup table
    for (const [category, list] of Object.entries(categories)) {
      if (!Array.isArray(list)) continue;

      for (const body of list) {
        flat[body.id] = {
          ...body,
          category
        };
      }
    }

    console.log("Loaded body rules (flattened):", flat);
    console.groupEnd();
    return flat;

  } catch (err) {
    console.error("Error loading body rules:", err);
    console.groupEnd();
    return {};
  }
}
