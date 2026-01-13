export function applySuspension(actor, rules, rulesData) {
  const suspensionId = actor.system.suspensionType;
  if (!suspensionId) return;

  const suspData = rulesData.suspensions?.[suspensionId];
  if (!suspData) return;

  // HC modifiers
  rules.handling += suspData.hc || 0;

  // Special cases for vans/subcompacts
  const bodyId = actor.system.bodyType;
  if (bodyId === "van" && suspData.vanHC) rules.handling += suspData.vanHC;
  if (bodyId === "subcompact" && suspData.subHC) rules.handling += suspData.subHC;
}
