export function applyEngine(actor, rules, rulesData) {
  const engineId = actor.system.powerPlantType;
  if (!engineId) return;

  const engineData = rulesData.powerplants?.[engineId];
  if (!engineData) return;

  rules.weight += engineData.weight;
  rules.spaces += engineData.spaces;

  rules.pf = engineData.pf;
  rules.mpg = engineData.baseMPG;
  rules.dp = engineData.dp;

  // Engine cost handled elsewhere
}
