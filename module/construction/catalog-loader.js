// module/construction/catalog-loader.js

import bodiesData from "../../data/bodies.json" assert { type: "json" };
import chassisData from "../../data/chassis.json" assert { type: "json" };

/**
 * Flatten wrapped JSON structures into simple lookup maps.
 *
 * @returns {{
 *   bodies: Record<string, any>,
 *   chassis: Record<string, any>,
 *   bodyMods: Record<string, any>
 * }}
 */
export function loadCatalogs() {
  const bodies = {};
  const chassis = {};
  const bodyMods = {};

  // --- Load bodies ---------------------------------------------------------
  for (const category of Object.keys(bodiesData.bodies)) {
    const list = bodiesData.bodies[category];

    // body-mods are stored inside bodies.json, but belong in their own map
    if (category === "body-mod") {
      for (const mod of list) {
        bodyMods[mod.id] = mod;
      }
      continue;
    }

    // normal bodies
    for (const body of list) {
      bodies[body.id] = body;
    }
  }

  // --- Load chassis --------------------------------------------------------
  for (const chassisCategory of Object.keys(chassisData.chassis)) {
    for (const ch of chassisData.chassis[chassisCategory]) {
      chassis[ch.id] = ch;
    }
  }

  return { bodies, chassis, bodyMods };
}
