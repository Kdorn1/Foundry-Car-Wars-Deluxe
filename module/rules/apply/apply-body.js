// module/rules/apply/apply-body.js

export function applyBody(actor, rules) {
  const bodyId = actor.system.bodyType;
  if (!bodyId) return;

  const bodyData = game.cw.catalog.bodies.find(b => b.id === bodyId);
  if (!bodyData) return;

  // Weight & spaces
  rules.weight += bodyData.weight;
  rules.totalSpaces = bodyData.spaces;

  // Max weight (special: body defines this)
  rules.maxWeight = bodyData.maxWeight;

  // Cargo
  rules.cargoSpaces = bodyData.cargoSpaces || 0;

  // Armor cost/weight per point (used later)
  rules.armorCostPerPoint = bodyData.armorCostPerPoint;
  rules.armorWeightPerPoint = bodyData.armorWeightPerPoint;

  // Special rules (if any)
  if (bodyData.specialRules) {
    for (const rule of bodyData.specialRules) {
      // Placeholder for future body-specific rules
    }
  }
}
