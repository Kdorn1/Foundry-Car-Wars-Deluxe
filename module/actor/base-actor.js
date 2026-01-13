// module/actor/base-actor.js
// Base Actor class for all Car Wars actors (vehicle + driver)

export class CarWarsActor extends Actor {
  /** @inheritdoc */
  prepareBaseData() {
    super.prepareBaseData();
  }

  /** @inheritdoc */
  prepareDerivedData() {
    super.prepareDerivedData();
  }

  /** @inheritdoc */
  prepareEmbeddedDocuments() {
    super.prepareEmbeddedDocuments();
  }

  /** @inheritdoc */
  prepareData() {
    super.prepareData();
  }

  // ---------------------------------------------------------------------------
  // Typed Accessors
  // ---------------------------------------------------------------------------

  /** Strongly-typed DataModel */
  get model() {
    return this.system;
  }

  /** Vehicle accessor (null if not a vehicle) */
  get vehicle() {
    return this.type === "vehicle" ? this.system : null;
  }

  /** Driver accessor (null if not a driver) */
  get driver() {
    return this.type === "driver" ? this.system : null;
  }

  /** Crew array (vehicle only) */
  get crew() {
    return this.type === "vehicle" ? this.system.crew : [];
  }

  /** Movement block (vehicle only) */
  get movement() {
    return this.type === "vehicle" ? this.system.movement : null;
  }

  /** Armor block (vehicle only) */
  get armor() {
    return this.type === "vehicle" ? this.system.armor : null;
  }

  /** Components block (vehicle only) */
  get components() {
    return this.type === "vehicle" ? this.system.components : null;
  }

  /** Performance block (vehicle only) */
  get performance() {
    return this.type === "vehicle" ? this.system.performance : null;
  }

  // ---------------------------------------------------------------------------
  // Typed Helpers — Movement (RAW-accurate)
  // ---------------------------------------------------------------------------

  /** Apply a hazard (temporary penalty). Never modifies base HC. */
  applyHazard(amount = 1) {
    if (!this.movement) return;

    const mv = this.movement;
    const baseHC = this.system.meta.handlingClass;

    mv.hazards = Math.max(0, mv.hazards + amount);

    // Recompute effective HC
    mv.currentHC = baseHC - mv.hazards;

    // Update skid state
    mv.isSkidding = mv.hazards > mv.currentHC;
  }

  /** Clear all hazards (start of turn). */
  clearHazards() {
    if (!this.movement) return;

    const mv = this.movement;
    const baseHC = this.system.meta.handlingClass;

    mv.hazards = 0;
    mv.currentHC = baseHC;
    mv.isSkidding = false;
  }

  /** Set speed safely. */
  setSpeed(value) {
    if (!this.movement) return;

    const mv = this.movement;
    mv.lastSpeed = mv.currentSpeed;
    mv.currentSpeed = Math.max(0, value);
  }

  /** Advance movement phase. */
  advancePhase() {
    if (!this.movement) return;

    const mv = this.movement;
    mv.phase = Math.min(mv.phasesPerTurn, mv.phase + 1);
  }

  /** Reset phase to 1. */
  resetPhase() {
    if (!this.movement) return;

    this.movement.phase = 1;
  }

  // ---------------------------------------------------------------------------
  // Typed Helpers — Armor
  // ---------------------------------------------------------------------------

  /** Apply armor damage to a facing. */
  damageArmor(facing, amount) {
    if (!this.armor) return;

    const value = this.armor[facing];
    if (typeof value !== "number") return;

    this.armor[facing] = Math.max(0, value - amount);
  }

  /** Repair armor on a facing. */
  repairArmor(facing, amount) {
    if (!this.armor) return;

    const value = this.armor[facing];
    if (typeof value !== "number") return;

    this.armor[facing] = value + amount;
  }

  /** Mark a facing as breached. */
  breach(facing) {
    if (!this.armor?.breached) return;
    this.armor.breached[facing] = true;
  }

  // ---------------------------------------------------------------------------
  // Typed Helpers — Weapons
  // ---------------------------------------------------------------------------

  /** Fire a weapon by index. Returns true if fired. */
  fireWeapon(index) {
    const weapons = this.components?.weapons;
    if (!weapons || !weapons[index]) return false;

    const w = weapons[index];
    if (w.destroyed) return false;
    if (w.ammoCurrent <= 0) return false;

    w.ammoCurrent -= 1;
    return true;
  }

  /** Reload a weapon to max ammo. */
  reloadWeapon(index) {
    const weapons = this.components?.weapons;
    if (!weapons || !weapons[index]) return;

    const w = weapons[index];
    w.ammoCurrent = w.ammoMax;
  }

  /** Destroy a weapon. */
  destroyWeapon(index) {
    const weapons = this.components?.weapons;
    if (!weapons || !weapons[index]) return;

    weapons[index].destroyed = true;
  }

  // ---------------------------------------------------------------------------
  // Typed Helpers — Crew
  // ---------------------------------------------------------------------------

  /** Add a crew member. */
  addCrewMember(data) {
    if (!this.crew) return;
    this.crew.push(data);
  }

  /** Remove crew member by index. */
  removeCrewMember(index) {
    if (!this.crew) return;
    this.crew.splice(index, 1);
  }

  /** Update crew role. */
  updateCrewRole(index, role) {
    if (!this.crew || !this.crew[index]) return;
    this.crew[index].role = role;
  }

  // ---------------------------------------------------------------------------
  // Typed Helpers — Components
  // ---------------------------------------------------------------------------

  /** Damage the powerplant. */
  damagePowerplant(amount) {
    const pp = this.components?.powerplant;
    if (!pp) return;

    pp.dp = Math.max(0, pp.dp - amount);
  }

  /** Ignite the gas tank. */
  igniteGasTank() {
    const tank = this.components?.gasTank;
    if (!tank) return;

    tank.onFire = true;
  }

  /** Blow a tire (increment blownCount). */
  blowTire() {
    const tires = this.components?.tires;
    if (!tires) return;

    tires.blownCount = Math.min(tires.quantity, tires.blownCount + 1);
  }
}
