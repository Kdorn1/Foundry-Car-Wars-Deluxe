/**
 * Suspension Rules Loader
 * -----------------------
 * Loads suspension rules from the system data folder and returns
 * a normalized lookup object keyed by suspension type.
 *
 * Example expected JSON structure:
 * {
 *   "suspension": {
 *     "light":    { ... },
 *     "standard": { ... },
 *     "heavy":    { ... }
 *   }
 * }
 */

const SUSPENSION_PATH = "systems/carwars-system/data/suspension.json";

export async function loadSuspensionRules() {
  console.group("Car Wars: Loading suspension rules");

  try {
    const response = await fetch(SUSPENSION_PATH);

    if (!response.ok) {
      console.error(`Failed to load suspension rules from ${SUSPENSION_PATH}`);
      console.groupEnd();
      return {};
    }

    const raw = await response.json();

    // Normalize: some JSON files may wrap data in a top-level key
    const data = raw.suspension || raw;

    if (typeof data !== "object") {
      console.error("Suspension rules JSON is not an object", data);
      console.groupEnd();
      return {};
    }

    console.log("Loaded suspension rules:", data);
    console.groupEnd();
    return data;

  } catch (err) {
    console.error("Error loading suspension rules:", err);
    console.groupEnd();
    return {};
  }
}
