// module/rules/apply/apply-accessories.js

export function applyAccessories(actor, rules) {
  const accessories = actor.items.filter(i => i.type === "accessory");

  for (const acc of accessories) {
    const accId = acc.system.key;
    const accData = game.cw.catalog.accessories.find(a => a.id === accId);
    if (!accData) continue;

    rules.weight += accData.weight || 0;
    rules.spaces += accData.spaces || 0;

    // Special rules
    for (const rule of accData.specialRules || []) {
      applyAccessoryRule(rule, rules);
    }
  }
}

function applyAccessoryRule(rule, rules) {
  const [key, value] = parseRule(rule);

  switch (key) {
    case "handlingBonus":
      rules.handling += Number(value);
      break;

    case "hazardMod":
      rules.hazard += Number(value);
      break;

    case "weaponSpaceBonus":
      rules.spaces += Number(value);
      break;

    default:
      console.warn("Unknown accessory rule:", rule);
  }
}

function parseRule(rule) {
  if (rule.includes(":")) {
    const [key, value] = rule.split(":");
    return [key, value];
  }
  return [rule, true];
}
