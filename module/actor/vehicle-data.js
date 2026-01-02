// module/actor/vehicle-data.js

import { RuleEngine } from "../rules/rule-engine.js";
import { validateVehicle } from "../construction/validation/index.js";
import { CatalogLoader } from "../construction/catalog-loader.js";

export class CarWarsVehicleDataModel extends foundry.abstract.DataModel {
  static defineSchema() {
    const {
      StringField,
      NumberField,
      ArrayField,
      SchemaField,
      BooleanField
    } = foundry.data.fields;

    return {

      // ============================================================
      // VEHICLE TYPE (car, cycle, trike, truck, tractor, trailer, bus, rv, copter)
      // ============================================================
      type: new StringField({ initial: "car" }),

      // ============================================================
      // META (RAW record sheet fields)
      // ============================================================
      meta: new SchemaField({
        name: new StringField({ initial: "" }),
        size: new StringField({ initial: "" }),
        weight: new NumberField({ initial: 0 }),
        cost: new NumberField({ initial: 0 }),
        chassis: new StringField({ initial: "" }),
        suspension: new StringField({ initial: "" }),
        acceleration: new NumberField({ initial: 0 }),
        handlingClass: new NumberField({ initial: 0 }),
        extras: new ArrayField(new StringField(), { initial: [] }),
        notes: new ArrayField(new StringField(), { initial: [] })
      }),

      // ============================================================
      // ARMOR (full RAW superset)
      // ============================================================
      armor: new SchemaField({

        // Standard facings
        front: new NumberField({ initial: 0 }),
        back: new NumberField({ initial: 0 }),
        left: new NumberField({ initial: 0 }),
        right: new NumberField({ initial: 0 }),
        top: new NumberField({ initial: 0 }),
        underbody: new NumberField({ initial: 0 }),

        // Segmented armor (bus, RV, trailer)
        frontLeft: new NumberField({ initial: 0 }),
        frontRight: new NumberField({ initial: 0 }),
        backLeft: new NumberField({ initial: 0 }),
        backRight: new NumberField({ initial: 0 }),
        frontTop: new NumberField({ initial: 0 }),
        backTop: new NumberField({ initial: 0 }),
        frontUnderbody: new NumberField({ initial: 0 }),
        backUnderbody: new NumberField({ initial: 0 }),

        // Cab + Carrier (tractor / ten-wheeler)
        cabFront: new NumberField({ initial: 0 }),
        cabBack: new NumberField({ initial: 0 }),
        cabLeft: new NumberField({ initial: 0 }),
        cabRight: new NumberField({ initial: 0 }),
        cabTop: new NumberField({ initial: 0 }),
        cabUnderbody: new NumberField({ initial: 0 }),

        carrierFront: new NumberField({ initial: 0 }),
        carrierBack: new NumberField({ initial: 0 }),
        carrierLeft: new NumberField({ initial: 0 }),
        carrierRight: new NumberField({ initial: 0 }),
        carrierTop: new NumberField({ initial: 0 }),
        carrierUnderbody: new NumberField({ initial: 0 }),

        // Helicopter
        mainRotor: new NumberField({ initial: 0 }),
        stabilizerRotor: new NumberField({ initial: 0 }),

        // Breach states (unified)
        breached: new SchemaField({
          front: new BooleanField({ initial: false }),
          back: new BooleanField({ initial: false }),
          left: new BooleanField({ initial: false }),
          right: new BooleanField({ initial: false }),
          top: new BooleanField({ initial: false }),
          underbody: new BooleanField({ initial: false })
        })
      }),

      // ============================================================
      // COMPONENTS (powerplant, gas tank, tires, weapons, accessories)
      // ============================================================
      components: new SchemaField({

        powerplant: new SchemaField({
          id: new StringField({ initial: "" }),
          dp: new NumberField({ initial: 0 }),
          onFire: new BooleanField({ initial: false }),
          destroyed: new BooleanField({ initial: false })
        }),

        gasTank: new SchemaField({
          id: new StringField({ initial: "" }),
          gallons: new NumberField({ initial: 0 }),
          dp: new NumberField({ initial: 0 }),
          onFire: new BooleanField({ initial: false }),
          destroyed: new BooleanField({ initial: false })
        }),

        tires: new SchemaField({
          id: new StringField({ initial: "" }),
          optionIds: new ArrayField(new StringField(), { initial: [] }),
          quantity: new NumberField({ initial: 4 }),
          dpPerTire: new NumberField({ initial: 0 }),
          blownCount: new NumberField({ initial: 0 })
        }),

        weapons: new ArrayField(
          new SchemaField({
            id: new StringField({ required: true }),
            mount: new StringField({ initial: "front" }),
            ammoCurrent: new NumberField({ initial: 0 }),
            ammoMax: new NumberField({ initial: 0 }),
            dp: new NumberField({ initial: 0 }),
            destroyed: new BooleanField({ initial: false })
          }),
          { initial: [] }
        ),

        accessories: new ArrayField(
          new SchemaField({
            id: new StringField({ required: true }),
            dp: new NumberField({ initial: 0 }),
            destroyed: new BooleanField({ initial: false }),
            spaceUsed: new NumberField({ initial: 0 }),
            spaceGranted: new NumberField({ initial: 0 }),
            weightOverride: new NumberField({ initial: 0 }),
            costOverride: new NumberField({ initial: 0 })
          }),
          { initial: [] }
        )
      }),

      // ============================================================
      // MOVEMENT (RAW control + movement engine)
      // ============================================================
      movement: new SchemaField({
        currentSpeed: new NumberField({ initial: 0 }),
        lastSpeed: new NumberField({ initial: 0 }),
        currentHC: new NumberField({ initial: 0 }),
        hazards: new NumberField({ initial: 0 }),
        isSkidding: new BooleanField({ initial: false }),
        isSpinout: new BooleanField({ initial: false }),

        // ★ NEW RAW FIELD — Handling Track (–6 to +6)
        handlingStatus: new NumberField({ initial: 0 }),

        // ★ NEW RAW FIELD — Last maneuver difficulty (D1–D7)
        lastManeuverDifficulty: new NumberField({ initial: 0 }),

        // ★ NEW RAW FIELD — Terrain hazard modifier (D1–D6)
        terrainHazard: new NumberField({ initial: 0 }),

        // ★ NEW RAW FIELD — Deceleration hazard (D1/D3/D7)
        decelHazard: new NumberField({ initial: 0 }),

        // ★ NEW RAW FIELD — Control roll target (computed)
        controlTarget: new NumberField({ initial: 0 }),

        // ★ NEW RAW FIELD — Temporary speed (collision)
        temporarySpeed: new NumberField({ initial: 0 }),

        // ★ NEW RAW FIELD — Conforming movement flag
        isConforming: new BooleanField({ initial: false }),

        skidData: new SchemaField({
          direction: new StringField({ initial: "" }),
          distance: new NumberField({ initial: 0 })
        }),

        phasesPerTurn: new NumberField({ initial: 5 }),
        phase: new NumberField({ initial: 1 })
      }),

      // ============================================================
      // PERFORMANCE (derived by rule engine)
      // ============================================================
      performance: new SchemaField({
        topSpeed: new NumberField({ initial: 0 }),
        accelLimit: new NumberField({ initial: 0 }),
        decelLimit: new NumberField({ initial: 0 }),
        weightCapacity: new NumberField({ initial: 0 }),
        spaceCapacity: new NumberField({ initial: 0 })
      }),

      // ============================================================
      // CREW (RAW record sheet)
      // ============================================================
      crew: new SchemaField({
        driver: new SchemaField({
          name: new StringField({ initial: "" }),
          skills: new ArrayField(new StringField(), { initial: [] }),
          equipment: new ArrayField(new StringField(), { initial: [] }),
          damage: new StringField({ initial: "" }),
          notes: new StringField({ initial: "" })
        }),
        gunner: new SchemaField({
          name: new StringField({ initial: "" }),
          skills: new ArrayField(new StringField(), { initial: [] }),
          equipment: new ArrayField(new StringField(), { initial: [] }),
          damage: new StringField({ initial: "" }),
          notes: new StringField({ initial: "" })
        }),
        occupants: new ArrayField(new StringField(), { initial: [] })
      }),

      // ============================================================
      // STATE (fire, breach, destruction)
      // ============================================================
      state: new SchemaField({
        burning: new BooleanField({ initial: false }),
        destroyed: new BooleanField({ initial: false }),
        breached: new BooleanField({ initial: false })
      }),

      // ============================================================
      // VALIDATION (UI only)
      // ============================================================
      validation: new SchemaField({
        errors: new ArrayField(new StringField(), { initial: [] }),
        warnings: new ArrayField(new StringField(), { initial: [] })
      })
    };
  }

  // ============================================================
  // PREPARE DATA (rule engine + validation + movement)
  // ============================================================
  prepareData() {
    super.prepareData();

    const engine = new RuleEngine(this.parent);
    const results = engine.applyAll() || {};

    // Derived values (weight, spaces, performance, etc.)
    this.meta.weight = results.weight ?? this.meta.weight;
    this.meta.cost = results.totalCost ?? this.meta.cost;

    this.performance.topSpeed = results.topSpeed ?? 0;
    this.performance.accelLimit = results.accel ?? 0;
    this.performance.decelLimit = results.decel ?? 0;
    this.performance.weightCapacity = results.maxWeight ?? 0;
    this.performance.spaceCapacity = results.totalSpaces ?? 0;

    // Validation
    const catalogs = CatalogLoader.getAll();
    const validation = validateVehicle(this, catalogs);
    this.validation = validation;

    // Movement reset at phase 1
    if (this.movement.phase === 1) {
      this.movement.hazards = 0;
    }

    // Skid detection
    this.movement.isSkidding =
      this.movement.hazards > this.movement.currentHC;
  }
}
