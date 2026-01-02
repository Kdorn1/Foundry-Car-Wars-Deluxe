// module/actor/armor-init.js
import armorCatalog from "../../data/armor.json" assert { type: "json" };

/**
 * RAW Car Wars DP-per-point mapping.
 * Your armor.json does NOT include DP values, so we derive them here.
 */
const DP_PER_POINT = {
  "normal": 1,
  "fp": 1,
  "lr": 1,
  "lrfp": 1,
  "rp": 1,
  "rpfp": 1,
  "metal": 2,
  "lr-metal": 2
};

/**
 * Debug toggle — set to true to enable verbose logging.
 */
const DEBUG = false;

/**
 * Cache to avoid recalculating DP unnecessarily.
 * Keyed by actor.id.
 */
const lastArmorState = new Map();

/**
 * Initialize armor DP for a vehicle.
 * This version includes:
 *  - Validation
 *  - Optimization
 *  - Debug logging
 *  - Full RAW DP initialization
 *
 * @param {Actor} vehicle
 */
export function initializeArmorDP(vehicle) {
  const sys = vehicle.system;
  const armorType = sys.armor.type;

  // ------------------------------------------------------------
  // VALIDATION
  // ------------------------------------------------------------
  if (!DP_PER_POINT.hasOwnProperty(armorType)) {
    console.warn(
      `ArmorInit: Unknown armor type "${armorType}" on vehicle "${vehicle.name}". Defaulting to 1 DP/pt.`
    );
  }

  const dpPerPoint = DP_PER_POINT[armorType] ?? 1;

  // ------------------------------------------------------------
  // OPTIMIZATION — detect if anything changed
  // ------------------------------------------------------------
  const cacheKey = vehicle.id;
  const prev = lastArmorState.get(cacheKey);

  const currentState = {
    armorType,
    front: sys.armor.front,
    back: sys.armor.back,
    left: sys.armor.left,
    right: sys.armor.right,
    top: sys.armor.top,
    under: sys.armor.under,
    componentArmor: sys.armor.componentArmor.map(c => c.points),
    wheelguards: [...sys.armor.wheelguards],
    wheelhubs: [...sys.armor.wheelhubs],
    ramplate: sys.armor.ramplate.has
  };

  if (prev && deepEqual(prev, currentState)) {
    if (DEBUG) console.log(`ArmorInit: No changes detected for ${vehicle.name}. Skipping DP recalculation.`);
    return;
  }

  // Update cache
  lastArmorState.set(cacheKey, currentState);

  // ------------------------------------------------------------
  // DEBUG LOGGING — before changes
  // ------------------------------------------------------------
  if (DEBUG) {
    console.group(`ArmorInit: Initializing DP for ${vehicle.name}`);
    console.log("Armor type:", armorType);
    console.log("DP per point:", dpPerPoint);
  }

  // ------------------------------------------------------------
  // 1. Main armor facings
  // ------------------------------------------------------------
  const facings = ["front", "back", "left", "right", "top", "under"];

  for (const facing of facings) {
    const pts = sys.armor[facing] ?? 0;

    const dpKey = `dp${capitalize(facing)}`;
    const breachKey = `breached${capitalize(facing)}`;

    sys.armor[dpKey] = pts * dpPerPoint;
    sys.armor[breachKey] = false;

    if (DEBUG) {
      console.log(
        `Facing ${facing}: ${pts} pts → ${sys.armor[dpKey]} DP (breached reset)`
      );
    }
  }

  // ------------------------------------------------------------
  // 2. Component armor
  // ------------------------------------------------------------
  for (const comp of sys.armor.componentArmor) {
    comp.dpCurrent = comp.points * dpPerPoint;
    comp.breached = false;

    if (DEBUG) {
      console.log(
        `Component armor (${comp.location}): ${comp.points} pts → ${comp.dpCurrent} DP`
      );
    }
  }

  // ------------------------------------------------------------
  // 3. Wheelguards & wheelhubs
  // ------------------------------------------------------------
  sys.armor.wheelguards = sys.armor.wheelguards.map((pts, i) => {
    const dp = pts * dpPerPoint;
    if (DEBUG) console.log(`Wheelguard ${i}: ${pts} pts → ${dp} DP`);
    return dp;
  });

  sys.armor.wheelhubs = sys.armor.wheelhubs.map((pts, i) => {
    const dp = pts * dpPerPoint;
    if (DEBUG) console.log(`Wheelhub ${i}: ${pts} pts → ${dp} DP`);
    return dp;
  });

  // ------------------------------------------------------------
  // 4. Ramplate DP (RAW: ½ of front armor DP)
  // ------------------------------------------------------------
  if (sys.armor.ramplate.has) {
    const frontPts = sys.armor.front;
    const frontDP = frontPts * dpPerPoint;

    sys.armor.ramplate.dpCurrent = Math.floor(frontDP / 2);
    sys.armor.ramplate.destroyed = false;

    if (DEBUG) {
      console.log(
        `Ramplate: front ${frontPts} pts → ${frontDP} DP → ramplate ${sys.armor.ramplate.dpCurrent} DP`
      );
    }
  }

  if (DEBUG) console.groupEnd();
}

// ------------------------------------------------------------
// Helper: deep equality for optimization
// ------------------------------------------------------------
function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ------------------------------------------------------------
// Helper: capitalize
// ------------------------------------------------------------
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
