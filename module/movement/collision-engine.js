// module/movement/collision-engine.js
// ------------------------------------------------------------
// Car Wars Deluxe — Collision Engine (Phase 2)
// Pure logic only. No actor updates, no chat, no dice.
// ------------------------------------------------------------

import { resolveCollisionType } from "./collision-type.js";
import { getDamageModifier } from "./damage-modifier.js";
import { getTemporarySpeed } from "./temporary-speed.js";

/**
 * Compute a collision outcome (pure logic).
 */
export function resolveCollision({
  attacker,
  defender,
  type,
  attackerSpeed,
  defenderSpeed = 0,
  baseDamage
}) {
  const sysA = attacker.system;
  const sysB = defender?.system;

  // ------------------------------------------------------------
  // 1. Collision type → collision speed + facings
  // ------------------------------------------------------------
  const typeInfo = resolveCollisionType({
    type,
    attackerSpeed,
    defenderSpeed
  });

  const collisionSpeed = typeInfo.collisionSpeed;
  const attackerFacingHit = typeInfo.attackerFacingHit;
  const defenderFacingHit = typeInfo.defenderFacingHit;

  // ------------------------------------------------------------
  // 2. Damage Modifiers (DM)
  // ------------------------------------------------------------
  const attackerDM = getDamageModifier({
    weight: sysA.weight,
    isPedestrian: sysA?.isPedestrian
  });

  const defenderDM = defender
    ? getDamageModifier({
        weight: sysB.weight,
        isPedestrian: sysB?.isPedestrian
      })
    : 0;

  // ------------------------------------------------------------
  // 3. RAW damage math
  // ------------------------------------------------------------
  const damageToDefender = Math.floor(baseDamage * attackerDM);
  const damageToAttacker = defender ? Math.floor(baseDamage * defenderDM) : 0;

  // ------------------------------------------------------------
  // 4. Temporary Speed Table (TST)
  // ------------------------------------------------------------
  const attackerTempSpeed = getTemporarySpeed(attackerDM, defenderDM, attackerSpeed);
  const defenderTempSpeed = defender
    ? getTemporarySpeed(defenderDM, attackerDM, defenderSpeed)
    : 0;

  // ------------------------------------------------------------
  // 5. Post-collision speeds (RAW)
  // ------------------------------------------------------------
  const { attackerFinalSpeed, defenderFinalSpeed } =
    computePostCollisionSpeeds(
      type,
      attackerSpeed,
      defenderSpeed,
      attackerTempSpeed,
      defenderTempSpeed,
      attackerDM,
      defenderDM
    );

  // ------------------------------------------------------------
  // 6. Handling Status change (pure math only)
  // ------------------------------------------------------------
  const attackerHSChange = computeHandlingPenalty(attackerSpeed, attackerFinalSpeed);
  const defenderHSChange = defender
    ? computeHandlingPenalty(defenderSpeed, defenderFinalSpeed)
    : 0;

  // ------------------------------------------------------------
  // 7. Return structured collision outcome (Phase 2)
  // ------------------------------------------------------------
  return {
    type: "collision",
    collisionType: type,
    collisionSpeed,
    baseDamage,

    attacker: {
      id: attacker.id,
      facingHit: attackerFacingHit,
      damageTaken: damageToAttacker,
      tempSpeed: attackerTempSpeed,
      finalSpeed: attackerFinalSpeed,
      handlingPenalty: attackerHSChange
    },

    defender: defender && {
      id: defender.id,
      facingHit: defenderFacingHit,
      damageTaken: damageToDefender,
      tempSpeed: defenderTempSpeed,
      finalSpeed: defenderFinalSpeed,
      handlingPenalty: defenderHSChange
    }
  };
}

// ------------------------------------------------------------
// Helper: Handling penalty
// ------------------------------------------------------------
function computeHandlingPenalty(original, final) {
  const delta = Math.abs(original - final);
  return Math.ceil(delta / 10);
}

// ------------------------------------------------------------
// Helper: Post-collision speed logic (RAW)
// ------------------------------------------------------------
function computePostCollisionSpeeds(type, V1, V2, T1, T2) {
  switch (type) {
    case "head-on":
      return {
        attackerFinalSpeed: Math.abs(V1 - V2),
        defenderFinalSpeed: 0
      };

    case "rear-end":
      return {
        attackerFinalSpeed: T1 + T2,
        defenderFinalSpeed: T1 + T2
      };

    case "t-bone":
      return {
        attackerFinalSpeed: T1,
        defenderFinalSpeed: V2
      };

    case "sideswipe-same":
    case "sideswipe-opposite":
      return {
        attackerFinalSpeed: V1,
        defenderFinalSpeed: V2
      };

    case "fixed":
      return {
        attackerFinalSpeed: 0,
        defenderFinalSpeed: 0
      };

    default:
      return { attackerFinalSpeed: V1, defenderFinalSpeed: V2 };
  }
}
