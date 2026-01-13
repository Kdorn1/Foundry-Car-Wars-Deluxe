export function applyGasTank(actor, rules, rulesData) {
  const tankId = actor.system.gasTankType;
  if (!tankId) return;

  const tankData = rulesData.gasTanks?.[tankId];
  if (!tankData) return;

  const gallons = actor.system.gasGallons || 0;

  rules.weight += gallons * tankData.weightPerGallon;
  rules.spaces += tankData.space || 0;

  rules.dp += tankData.dp;
}
