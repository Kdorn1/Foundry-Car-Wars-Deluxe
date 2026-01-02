// module/actor/actor-sheet.js

export class CarWarsVehicleSheet extends foundry.appv1.sheets.ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["carwars", "sheet", "vehicle"],
      template: "systems/carwars-system/templates/actor/vehicle-sheet.html",
      width: 600,
      height: 400
    });
  }

  /** Inject validation data into the sheet */
  getData(options) {
    const data = super.getData(options);

    // Ensure validation block always exists
    data.system.validation = this.actor.system.validation ?? {
      errors: [],
      warnings: [],
      info: []
    };

    return data;
  }
}

export class CarWarsDriverSheet extends foundry.appv1.sheets.ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["carwars", "sheet", "driver"],
      template: "systems/carwars-system/templates/actor/driver-sheet.html",
      width: 500,
      height: 350
    });
  }

  /** Driver sheet may eventually need validation too */
  getData(options) {
    const data = super.getData(options);

    // Provide empty validation block for consistency
    data.system.validation = this.actor.system.validation ?? {
      errors: [],
      warnings: [],
      info: []
    };

    return data;
  }
}
