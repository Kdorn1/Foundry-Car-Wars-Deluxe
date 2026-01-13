export function applyArmor(actor, rules, rulesData) {
  const armor = actor.system.armor;
  if (!armor) return;

  const totalPoints =
    armor.front +
    armor.back +
    armor.left +
    armor.right +
    armor.top +
    armor.under;

  rules.armorPoints = totalPoints;

  // Weight & cost per point come from body
  if (rules.armorWeightPerPoint) {
    rules.weight += totalPoints * rules.armorWeightPerPoint;
  }
}
