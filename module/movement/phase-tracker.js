// module/movement/phase-tracker.js
// ------------------------------------------------------------
// Car Wars Deluxe Edition — Movement Phase Tracker (Phase 2)
// Adds checks for:
// - pending control rolls
// - crash outcomes
// - conforming movement
// - spinout recovery
// ------------------------------------------------------------

export class PhaseTracker {
  constructor() {
    this.currentPhase = 1;
    this.maxPhases = 10;
  }

  nextPhase() {
    this.currentPhase = Math.min(this.currentPhase + 1, this.maxPhases);
    console.log(`🚗 [carwars] Movement Phase advanced to ${this.currentPhase}`);
  }

  resetPhases() {
    this.currentPhase = 1;
    console.log("🔄 [carwars] Movement Phases reset to 1");
  }

  /**
   * Determine whether a vehicle should act in this phase.
   * Phase 2 rules:
   * - Vehicle must have phasesPerTurn >= currentPhase
   * - Vehicle must NOT have a pending control roll
   * - Vehicle must NOT have an unresolved crashOutcome
   * - Vehicle must NOT be conforming
   * - Vehicle must NOT be in spinout recovery
   */
  shouldVehicleAct(vehicle) {
    const mv = vehicle?.system?.movement;
    if (!mv) return false;

    // RAW: vehicle only acts if within its allowed phases
    if (!vehicle.system.phasesPerTurn) return false;
    if (this.currentPhase > vehicle.system.phasesPerTurn) return false;

    // Phase 2: pending control roll blocks action
    if (mv.pendingControlRoll) return false;

    // Phase 2: unresolved crash outcome blocks action
    if (mv.crashOutcome) return false;

    // RAW: conforming vehicles do not act independently
    if (mv.isConforming) return false;

    // RAW: spinout recovery skips this phase
    if (mv.wasSpinoutLastPhase) return false;

    return true;
  }

  debugPhase(vehicles) {
    console.log(`📘 [carwars] Phase ${this.currentPhase} acting vehicles:`);

    for (const v of vehicles) {
      const acts = this.shouldVehicleAct(v);
      console.log(` - ${v.name}: ${acts ? "ACTS" : "waits"}`);
    }
  }
}
