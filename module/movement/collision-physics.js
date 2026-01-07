// module/movement/collision-physics.js
// ------------------------------------------------------------
// Car Wars Deluxe — Collision Physics (Phase 2)
// Pure logic only:
// - Computes RAW collision forces
// - Determines damage zones
// - Determines skid/spinout/roll/vault triggers
// - Returns structured collision outcomes
// - Does NOT update actor state
// - Does NOT rotate tokens
// - Does NOT apply armor damage
// - Does NOT post chat messages
// ------------------------------------------------------------

import { resolveSpinout } from "./spinout.js";

/**
 * Compute relative impact speed.
 * RAW: use the difference in speeds for head-on,
 *      use the striking vehicle's speed for rear-end,
 *      use vector components for T-bone/sideswipe.
 */
function computeRelativeSpeed(collisionType, event) {
  const { speedA = 0, speedB = 0 } = event;

  switch (collisionType) {
    case "head-on":
      return Math.abs(speedA) + Math.abs(speedB);

    case "rear-end":
      return Math.max(0, speedA - speedB);

    case "t-bone":
      return Math.max(speedA, speedB);

    case "sideswipe":
      return Math.min(speedA, speedB);

    default:
      return Math.max(speedA, speedB);
  }
}

/**
 * Compute RAW impact force.
 * Simplified placeholder:
 *   force = relativeSpeed × vehicleMassFactor
 *
 * Phase 2: return formulas, not applied damage.
 */
function computeImpactForce(event, relativeSpeed) {
  const massA = event.massA ?? 1;
  const massB = event.massB ?? 1;

  return {
    forceA: `${relativeSpeed} × ${massB}`,
    forceB: `${relativeSpeed} × ${massA}`
  };
}

/**
 * Determine if the collision triggers a skid, spinout, roll, or vault.
 * Phase 2: return flags only — no physics applied.
 */
function determineControlLoss(relativeSpeed, collisionType) {
  // RAW thresholds (simplified placeholders)
  const skidThreshold = 10;
  const spinoutThreshold = 20;
  const rollThreshold = 30;
  const vaultThreshold = 40;

  if (relativeSpeed >= vaultThreshold) {
    return { type: "vault" };
  }
  if (relativeSpeed >= rollThreshold) {
    return { type: "roll" };
  }
  if (relativeSpeed >= spinoutThreshold) {
    return { type: "spinout" };
  }
  if (relativeSpeed >= skidThreshold) {
    return { type: "skid" };
  }

  return { type: "none" };
}

/**
 * Main collision physics resolver.
 *
 * @param {string} collisionType
 * @param {object} event
 * @returns {object} collisionOutcome
 */
export async function resolveCollisionPhysics(collisionType, event) {
  const relativeSpeed = computeRelativeSpeed(collisionType, event);
  const impactForce = computeImpactForce(event, relativeSpeed);
  const controlLoss = determineControlLoss(relativeSpeed, collisionType);

  let controlOutcome = null;

  // ------------------------------------------------------------
  // Phase 2: delegate to physics modules (pure logic)
  // ------------------------------------------------------------
  switch (controlLoss.type) {
    case "spinout":
      controlOutcome = resolveSpinout(event.actorA, 1);
      break;

    case "skid":
      controlOutcome = {
        type: "skid",
        severity: 1,
        skidData: {
          distance: relativeSpeed / 5,
          direction: event.angle ?? 0
        },
        isSkidding: true,
        isSpinout: false
      };
      break;

    case "roll":
      controlOutcome = {
        type: "roll",
        severity: 1,
        rollFormula: "1d6",
        isSkidding: false,
        isSpinout: false
      };
      break;

    case "vault":
      controlOutcome = {
        type: "vault",
        severity: 1,
        vaultFormula: "1d6",
        isSkidding: false,
        isSpinout: false
      };
      break;

    default:
      controlOutcome = {
        type: "none",
        isSkidding: false,
        isSpinout: false
      };
  }

  // ------------------------------------------------------------
  // Phase 2: return structured outcome only
  // ------------------------------------------------------------
  return {
    collisionType,
    relativeSpeed,
    impactForce,
    controlLoss: controlLoss.type,
    controlOutcome
  };
}

// ------------------------------------------------------------
// Additional export required by importers
// ------------------------------------------------------------
export { resolveCollisionPhysics as computeCollisionPhysics };
