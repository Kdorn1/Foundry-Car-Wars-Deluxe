export function applyTires(actor, rules, rulesData) {
  const tireId = actor.system.tireType;
  if (!tireId) return;

  const tireData = rulesData.tires?.[tireId];
  if (!tireData) return;

  // Determine tire quantity
  const vehicleType = actor.system.vehicleType;

  const defaultCount =
    rulesData.vehicleDefaults?.[vehicleType]?.tireCount ?? 4;

  const quantity = actor.system.tireCount || defaultCount;

  rules.weight += tireData.weight * quantity;

  // Tire DP is tracked per tire, not added to vehicle DP
}
