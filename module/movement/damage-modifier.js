// damage-modifier.js
// Simple damage modifier module for CarWars movement/collision pipeline.
// Exports:
//   - computeCollisionDamage(collision): compute raw damage from collision data
//   - applyArmorModifiers(damage, armor): reduce damage by armor values
//   - finalizeDamage(collision, armor, options): full pipeline returning final damage object
// Default export contains the three functions.

const DEFAULT_OPTIONS = {
  // scale factor for converting kinetic energy to damage units
  kineticToDamage: 0.02,
  // minimum damage threshold (below this, treat as 0)
  minDamageThreshold: 0.5,
  // critical multiplier for head-on or high-angle collisions
  criticalSpeedThreshold: 30, // mph or units used by your engine
  criticalMultiplier: 1.5,
  // clamp final damage
  maxDamageCap: 1000
};

/**
 * Compute a raw damage estimate from collision data.
 * @param {Object} collision - collision info (expected fields below)
 *   collision.relativeSpeed {number} - relative speed at impact
 *   collision.massA {number} - mass of object A
 *   collision.massB {number} - mass of object B (optional)
 *   collision.collisionType {string} - e.g., "glancing", "headon", "rear", "side"
 *   collision.impactAngle {number} - degrees between vectors (0 = head-on)
 * @param {Object} [opts] - optional overrides for DEFAULT_OPTIONS
 * @returns {Object} { rawDamage: number, details: { kineticEnergy, base, crit } }
 */
export function computeCollisionDamage(collision = {}, opts = {}) {
  const o = Object.assign({}, DEFAULT_OPTIONS, opts);

  const v = Math.max(0, Number(collision.relativeSpeed) || 0);
  const mA = Math.max(1, Number(collision.massA) || 1);
  const mB = Math.max(0, Number(collision.massB) || 0);

  // approximate kinetic energy proxy: 0.5 * m * v^2
  // use combined mass when available to reflect shared energy
  const effectiveMass = mB > 0 ? (mA * mB) / (mA + mB) : mA;
  const kineticEnergy = 0.5 * effectiveMass * Math.pow(v, 2);

  // base damage scaled from kinetic energy
  let base = kineticEnergy * o.kineticToDamage;

  // collision type modifiers
  const typeModifiers = {
    headon: 1.2,
    side: 1.1,
    rear: 0.9,
    glancing: 0.6,
    default: 1.0
  };
  const typeMod = typeModifiers[collision.collisionType] ?? typeModifiers.default;
  base *= typeMod;

  // impact angle: more direct impacts (small angle) are worse
  const angle = Math.abs(Number(collision.impactAngle) || 0);
  const angleFactor = 1 + Math.max(0, (180 - angle) / 180); // ranges ~1..2
  base *= angleFactor;

  // critical hit if speed exceeds threshold
  let crit = false;
  let critMult = 1;
  if (v >= o.criticalSpeedThreshold) {
    crit = true;
    critMult = o.criticalMultiplier;
    base *= critMult;
  }

  // clamp and threshold
  const rawDamage = Math.min(o.maxDamageCap, Math.max(0, base));
  const finalRaw = rawDamage < o.minDamageThreshold ? 0 : rawDamage;

  return {
    rawDamage: finalRaw,
    details: {
      kineticEnergy,
      effectiveMass,
      typeMod,
      angleFactor,
      crit,
      critMult
    }
  };
}

/**
 * Apply armor modifiers to a damage value.
 * @param {number} damage - incoming damage
 * @param {Object|number} armor - either numeric armor rating or object:
 *   { front: number, side: number, rear: number, top: number, flat: number }
 *   If object provided, caller should pass which side was hit via options.hitLocation
 * @param {Object} [options] - { hitLocation: "front"|"side"|"rear"|"top"|"flat", absorbFactor: 1.0 }
 * @returns {Object} { finalDamage: number, absorbed: number, remaining: number, appliedArmor: number }
 */
export function applyArmorModifiers(damage, armor = 0, options = {}) {
  const opts = Object.assign({ hitLocation: "flat", absorbFactor: 1.0 }, options);

  let armorValue = 0;
  if (typeof armor === "number") {
    armorValue = armor;
  } else if (typeof armor === "object" && armor !== null) {
    armorValue = Number(armor[opts.hitLocation] ?? armor.flat ?? 0);
  }

  // Simple model: armorValue reduces damage by a percentage up to 90%
  // Convert armorValue to percent reduction: e.g., armor 50 -> 50% reduction scaled
  const maxReduction = 0.9;
  const reduction = Math.min(maxReduction, armorValue / (armorValue + 50)); // smooth curve
  const absorbed = damage * reduction * opts.absorbFactor;
  const remaining = Math.max(0, damage - absorbed);

  return {
    finalDamage: remaining,
    absorbed,
    remaining,
    appliedArmor: armorValue,
    reduction
  };
}

/**
 * Full pipeline: compute raw damage from collision, apply armor and optional modifiers,
 * and return a structured result.
 * @param {Object} collision - see computeCollisionDamage
 * @param {Object|number} armor - see applyArmorModifiers
 * @param {Object} [opts] - pipeline options forwarded to computeCollisionDamage and applyArmorModifiers
 * @returns {Object} {
 *   rawDamage, armorResult, finalDamage, details
 * }
 */
export function finalizeDamage(collision = {}, armor = 0, opts = {}) {
  const computeResult = computeCollisionDamage(collision, opts);
  const armorResult = applyArmorModifiers(computeResult.rawDamage, armor, opts);
  const finalDamage = Math.max(0, armorResult.finalDamage);

  return {
    rawDamage: computeResult.rawDamage,
    armorResult,
    finalDamage,
    details: computeResult.details
  };
}

// Default export for convenience
export default {
  computeCollisionDamage,
  applyArmorModifiers,
  finalizeDamage
};

// Additional export required by importers
export { finalizeDamage as getDamageModifier };
