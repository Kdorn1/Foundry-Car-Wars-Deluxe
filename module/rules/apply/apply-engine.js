// module/rules/apply/apply-engine.js

export function applyEngine(actor, rules) {
  const engineId = actor.system.powerPlantType;
  if (!engineId) return;

  const engineData = game.cw.catalog.powerplants.find(e => e.id === engineId);
  if (!engineData) return;

  rules.weight += engineData.weight;
  rules.spaces += engineData.spaces;

  rules.pf = engineData.pf;
  rules.mpg = engineData.baseMPG;
  rules.dp = engineData.dp;

  // Engine cost handled elsewhere
}
/* Auto-generated placeholder for apply-engine.js */
