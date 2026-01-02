// module/movement/maneuver-registry.js
// ------------------------------------------------------------
// Car Wars Deluxe Edition — Maneuver Registry (Phase 2)
// Pure static data. No UI fields, no dynamic state.
// ------------------------------------------------------------

/**
 * Maneuver definitions (pure data):
 * - id: Unique identifier
 * - name: Display name
 * - difficulty: RAW difficulty (integer)
 * - footprint: inches of forward movement consumed
 * - type: maneuver category
 * - hazard: optional RAW hazard modifier
 *
 * Phase 2: No UI fields, no dynamic fields (e.g., direction).
 */

export const MANEUVERS = {
  drift: {
    id: "drift",
    name: "Drift",
    difficulty: 1,
    footprint: 0.5,
    type: "drift"
  },

  bend: {
    id: "bend",
    name: "Bend",
    difficulty: 2,
    footprint: 1.0,
    type: "bend"
  },

  bend_half: {
    id: "bend_half",
    name: "Bend (1/2\")",
    difficulty: 1,
    footprint: 0.5,
    type: "bend"
  },

  swerve: {
    id: "swerve",
    name: "Swerve",
    difficulty: 2,
    footprint: 0.5,
    type: "swerve"
  },

  hard_swerve: {
    id: "hard_swerve",
    name: "Hard Swerve",
    difficulty: 3,
    footprint: 0.75,
    type: "hard-swerve"
  },

  tight_bend: {
    id: "tight_bend",
    name: "Tight Bend",
    difficulty: 3,
    footprint: 0.5,
    type: "tight-bend"
  },

  // ------------------------------------------------------------
  // Bootlegger Reverse (Option C RAW)
  // ------------------------------------------------------------
  bootlegger: {
    id: "bootlegger",
    name: "Bootlegger Reverse",
    difficulty: 7,
    footprint: 0,
    type: "bootlegger",
    hazard: 7
  }
};

/**
 * Get a maneuver definition by ID.
 */
export function getManeuver(id) {
  return MANEUVERS[id] || null;
}

/**
 * List all maneuvers as an array.
 */
export function listManeuvers() {
  return Object.values(MANEUVERS);
}
