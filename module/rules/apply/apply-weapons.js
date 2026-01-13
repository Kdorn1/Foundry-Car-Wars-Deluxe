export function applyWeapons(actor, rules, rulesData) {
  const weapons = actor.items.filter(i => i.type === "weapon");

  for (const w of weapons) {
    const weaponId = w.system.key;
    const weaponData = rulesData.weapons?.[weaponId];
    if (!weaponData) continue;

    rules.weight += weaponData.weight;
    rules.spaces += weaponData.spaces;

    // Ammo weight
    const ammo = w.system.ammo || 0;
    rules.weight += ammo * weaponData.ammoWeight;
  }
}
