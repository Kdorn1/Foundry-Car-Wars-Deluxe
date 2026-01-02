// module/rules/apply/apply-suspension.js

export function applySuspension(actor, rules) {
  const suspensionId = actor.system.suspensionType;
  if (!suspensionId) return;

  const suspData = game.cw.catalog.suspension.find(s => s.id === suspensionId);
  if (!suspData) return;

  // HC modifiers
  rules.handling += suspData.hc || 0;

  // Special cases for vans/subcompacts
  const bodyId = actor.system.bodyType;
  if (bodyId === "van" && suspData.vanHC) rules.handling += suspData.vanHC;
  if (bodyId === "subcompact" && suspData.subHC) rules.handling += suspData.subHC;
}
