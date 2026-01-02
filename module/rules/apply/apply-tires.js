// module/rules/apply/apply-tires.js

export function applyTires(actor, rules) {
  const tireId = actor.system.tireType;
  if (!tireId) return;

  const tireData = game.cw.catalog.tires.find(t => t.id === tireId);
  if (!tireData) return;

  const quantity = actor.system.tireCount || 4;

  rules.weight += tireData.weight * quantity;

  // Tire DP is tracked per tire, not added to vehicle DP
}
