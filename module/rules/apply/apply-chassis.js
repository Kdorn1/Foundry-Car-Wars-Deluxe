// module/rules/apply/apply-chassis.js

export function applyChassis(actor, rules) {
  const chassisId = actor.system.chassisType;
  if (!chassisId) return;

  const chassisData = game.cw.catalog.chassis.find(c => c.id === chassisId);
  if (!chassisData) return;

  // Chassis affects max weight
  rules.maxWeight = chassisData.maxWeight;

  // Chassis cost is handled in construction, not here
}
