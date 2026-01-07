// module/movement/control-table.js
// ------------------------------------------------------------
// Car Wars Deluxe Edition — RAW Control Table (Phase 2)
// Pure logic: computes control modifier and control roll target.
// No dice, no actor updates, no UI.
// ------------------------------------------------------------

const CONTROL_TABLE = [
  { min: 5, max: 10, values: { "3": "safe", "2": "safe", "1": "safe", "0": "safe", "-1": "safe", "-2": "safe", "-3": "safe", "-4": "safe", "-5": "safe", "-6": "safe" } },
  { min: 15, max: 20, values: { "3": "safe", "2": "safe", "1": "safe", "0": "safe", "-1": "safe", "-2": "safe", "-3": "safe", "-4": "safe", "-5": 2, "-6": 2 } },
  { min: 25, max: 30, values: { "3": "safe", "2": "safe", "1": "safe", "0": "safe", "-1": "safe", "-2": "safe", "-3": 2, "-4": 3, "-5": 4, "-6": 4 } },
  { min: 35, max: 40, values: { "3": "safe", "2": "safe", "1": "safe", "0": "safe", "-1": 2, "-2": 2, "-3": 3, "-4": 4, "-5": 5, "-6": 5 } },
  { min: 45, max: 50, values: { "3": "safe", "2": "safe", "1": "safe", "0": 2, "-1": 2, "-2": 3, "-3": 4, "-4": 5, "-5": 6, "-6": 6 } },
  { min: 55, max: 60, values: { "3": "safe", "2": "safe", "1": 2, "0": 2, "-1": 3, "-2": 4, "-3": 5, "-4": 6, "-5": "XX", "-6": "XX" } },
  { min: 65, max: 70, values: { "3": "safe", "2": 2, "1": 2, "0": 3, "-1": 4, "-2": 5, "-3": 6, "-4": "XX", "-5": "XX", "-6": "XX" } },
  { min: 75, max: 80, values: { "3": 2, "2": 2, "1": 3, "0": 4, "-1": 5, "-2": 6, "-3": "XX", "-4": "XX", "-5": "XX", "-6": "XX" } },
  { min: 85, max: 90, values: { "3": 2, "2": 3, "1": 4, "0": 5, "-1": 6, "-2": "XX", "-3": "XX", "-4": "XX", "-5": "XX", "-6": "XX" } },
  { min: 95, max: 100, values: { "3": 3, "2": 4, "1": 5, "0": 6, "-1": "XX", "-2": "XX", "-3": "XX", "-4": "XX", "-5": "XX", "-6": "XX" } },
  { min: 105, max: 110, values: { "3": 4, "2": 5, "1": 6, "0": "XX", "-1": "XX", "-2": "XX", "-3": "XX", "-4": "XX", "-5": "XX", "-6": "XX" } },
  { min: 115, max: 120, values: { "3": 5, "2": 6, "1": "XX", "0": "XX", "-1": "XX", "-2": "XX", "-3": "XX", "-4": "XX", "-5": "XX", "-6": "XX" } },
  { min: 125, max: 130, values: { "3": 6, "2": "XX", "1": "XX", "0": "XX", "-1": "XX", "-2": "XX", "-3": "XX", "-4": "XX", "-5": "XX", "-6": "XX" } }
];

/**
 * Lookup RAW control modifier.
 */
export function getControlModifier(speed, hs) {
  const key = String(hs);

  for (const row of CONTROL_TABLE) {
    if (speed >= row.min && speed <= row.max) {
      return row.values[key] ?? "XX";
    }
  }

  return "XX";
}

/**
 * Compute control roll requirements (pure logic).
 */
export function computeControlRoll({ speed, difficulty, handlingStatus }) {
  const modifier = getControlModifier(speed, handlingStatus);

  // No roll needed
  if (modifier === "safe") {
    return {
      requiresRoll: false,
      autoCrash: false,
      target: null,
      crashTable: null,
      modifier,
      difficulty,
      handlingStatus,
      speed
    };
  }

  // Automatic crash
  if (modifier === "XX") {
    return {
      requiresRoll: false,
      autoCrash: true,
      target: null,
      crashTable: 1,
      modifier,
      difficulty,
      handlingStatus,
      speed
    };
  }

  // Standard control roll
  const target = 7 + difficulty + modifier;

  return {
    requiresRoll: true,
    autoCrash: false,
    target,
    crashTable: 1,
    modifier,
    difficulty,
    handlingStatus,
    speed
  };
}

/**
 * Provide named export for modules expecting applyControlRoll.
 */
export const applyControlRoll = computeControlRoll;
