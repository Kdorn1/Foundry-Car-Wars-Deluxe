// module/rules/apply/apply-gas-tank.js

export function applyGasTank(actor, rules) {
  const tankId = actor.system.gasTankType;
  if (!tankId) return;

  const tankData = game.cw.catalog.gasTanks.find(t => t.id === tankId);
  if (!tankData) return;

  const gallons = actor.system.gasGallons || 0;

  rules.weight += gallons * tankData.weightPerGallon;
  rules.spaces += tankData.space || 0;

  rules.dp += tankData.dp;
}
