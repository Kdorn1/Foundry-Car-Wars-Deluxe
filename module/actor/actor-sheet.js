// module/actor/actor-sheet.js
// Modern V12-compliant Car Wars actor sheets using HandlebarsApplicationMixin

/* -------------------------------------------- */
/*  VEHICLE SHEET                               */
/* -------------------------------------------- */

export class CarWarsVehicleSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheet) {

  static DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: ["carwars", "sheet", "actor", "vehicle"],
    template: "systems/carwars-system/templates/actor/vehicle-sheet.html",
    width: 900,
    height: 700,
    resizable: true
  };

  /** @inheritdoc */
  getData(options) {
    const data = super.getData(options);
    data.actor = this.actor;
    data.system = this.actor.system;
    return data;
  }

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.isEditable) return;

    // Vehicle-specific listeners can be added here
  }
}

/* -------------------------------------------- */
/*  DRIVER SHEET                                */
/* -------------------------------------------- */

export class CarWarsDriverSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheet) {

  static DEFAULT_OPTIONS = {
    ...super.DEFAULT_OPTIONS,
    classes: ["carwars", "sheet", "actor", "driver"],
    template: "systems/carwars-system/templates/actor/driver-sheet.html",
    width: 600,
    height: 500,
    resizable: true
  };

  /** @inheritdoc */
  getData(options) {
    const data = super.getData(options);
    data.actor = this.actor;
    data.system = this.actor.system;
    return data;
  }

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.isEditable) return;

    // Driver-specific listeners can be added here
  }
}
