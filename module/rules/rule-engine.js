// module/rules/rule-engine.js

import { applyBody } from "./apply/apply-body.js";
import { applyChassis } from "./apply/apply-chassis.js";
import { applySuspension } from "./apply/apply-suspension.js";
import { applyEngine } from "./apply/apply-engine.js";
import { applyGasTank } from "./apply/apply-gas-tank.js";
import { applyTires } from "./apply/apply-tires.js";
import { applyArmor } from "./apply/apply-armor.js";
import { applyWeapons } from "./apply/apply-weapons.js";
import { applyAccessories } from "./apply/apply-accessories.js";

export class RuleEngine {
  constructor(actor) {
    this.actor = actor;

    this.rules = {
      weight: 0,
      spaces: 0,
      totalSpaces: 0,
      handling: 0,
      hazard: 0,
      pf: 0,
      mpg: 0,
      accel: 0,
      topSpeed: 0,
      dp: 0,
      maxWeight: 0,
      cargoSpaces: 0,
      armorPoints: 0,
      armorCostPerPoint: 0,
      armorWeightPerPoint: 0
    };

    this.debug = [];
  }

  log(label, data) {
    this.debug.push({ label, data });
  }

  applyAll() {
    this.log("START", { actor: this.actor.name });

    this._apply("Body", applyBody);
    this._apply("Chassis", applyChassis);
    this._apply("Suspension", applySuspension);
    this._apply("Engine", applyEngine);
    this._apply("Gas Tank", applyGasTank);
    this._apply("Tires", applyTires);
    this._apply("Armor", applyArmor);
    this._apply("Weapons", applyWeapons);
    this._apply("Accessories", applyAccessories);

    this.log("END TOTALS", structuredClone(this.rules));

    // Dump to console
    console.group(`RuleEngine: ${this.actor.name}`);
    for (const entry of this.debug) {
      console.log(entry.label, entry.data);
    }
    console.groupEnd();

    return this.rules;
  }

  _apply(label, fn) {
    const before = structuredClone(this.rules);
    fn(this.actor, this.rules);
    const after = this.rules;

    this.log(label, {
      weight: after.weight - before.weight,
      spaces: after.spaces - before.spaces,
      handling: after.handling - before.handling,
      hazard: after.hazard - before.hazard,
      pf: after.pf - before.pf,
      mpg: after.mpg - before.mpg,
      accel: after.accel - before.accel,
      topSpeed: after.topSpeed - before.topSpeed,
      dp: after.dp - before.dp,
      maxWeight: after.maxWeight !== before.maxWeight ? after.maxWeight : undefined,
      armorPoints: after.armorPoints - before.armorPoints
    });
  }
}
