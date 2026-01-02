// module/movement/collision-type.js
// ------------------------------------------------------------
// Car Wars Deluxe — Collision Type Router
// Computes RAW collision speed + impact facings for:
//   - head-on
//   - rear-end
//   - t-bone
//   - sideswipe (same direction)
//   - sideswipe (opposite direction)
//   - fixed object
// ------------------------------------------------------------

/**
 * Resolve collision type into:
 *  - collisionSpeed (RAW formula)
 *  - attackerFacingHit
 *  - defenderFacingHit
 *
 * This does NOT compute damage or crash tables.
 * That is handled by collision-engine.js.
 */
export function resolveCollisionType({
  type,
  attackerSpeed,
  defenderSpeed = 0,
  attackerFacing = null,
  defenderFacing = null
}) {
  let collisionSpeed = 0;
  let attackerFacingHit = "front";
  let defenderFacingHit = "front";

  switch (type) {
    // ------------------------------------------------------------
    // HEAD-ON
    // RAW: collision speed = V1 + V2
    // Affects front armor of both vehicles
    // ------------------------------------------------------------
    case "head-on":
      collisionSpeed = attackerSpeed + defenderSpeed;
      attackerFacingHit = "front";
      defenderFacingHit = "front";
      break;

    // ------------------------------------------------------------
    // REAR-END
    // RAW: collision speed = |V1 - V2|
    // Affects V1 front, V2 rear
    // ------------------------------------------------------------
    case "rear-end":
      collisionSpeed = Math.abs(attackerSpeed - defenderSpeed);
      attackerFacingHit = "front";
      defenderFacingHit = "rear";
      break;

    // ------------------------------------------------------------
    // T-BONE
    // RAW: collision speed = V1 speed
    // Affects V1 front, V2 side
    // ------------------------------------------------------------
    case "t-bone":
      collisionSpeed = attackerSpeed;
      attackerFacingHit = "front";
      defenderFacingHit = "side";
      break;

    // ------------------------------------------------------------
    // SIDESWIPE (same direction)
    // RAW: collision speed = |V1 - V2|
    // Affects side armor
    // ------------------------------------------------------------
    case "sideswipe-same":
      collisionSpeed = Math.abs(attackerSpeed - defenderSpeed);
      attackerFacingHit = "side";
      defenderFacingHit = "side";
      break;

    // ------------------------------------------------------------
    // SIDESWIPE (opposite direction)
    // RAW: collision speed = V1 + V2
    // Affects side armor
    // ------------------------------------------------------------
    case "sideswipe-opposite":
      collisionSpeed = attackerSpeed + defenderSpeed;
      attackerFacingHit = "side";
      defenderFacingHit = "side";
      break;

    // ------------------------------------------------------------
    // FIXED OBJECT
    // RAW: collision speed = V1
    // Object returns equal damage up to its DP
    // ------------------------------------------------------------
    case "fixed":
      collisionSpeed = attackerSpeed;
      attackerFacingHit = "front";
      defenderFacingHit = "front"; // obstacle "front" is conceptual
      break;

    default:
      throw new Error(`Unknown collision type: ${type}`);
  }

  return {
    type,
    collisionSpeed,
    attackerFacingHit,
    defenderFacingHit,
    attackerSpeed,
    defenderSpeed
  };
}
