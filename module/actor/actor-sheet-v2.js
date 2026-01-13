/**
 * ========================================================================
 *  Car Wars — ApplicationV2 Sheet Skeleton (Commented Out)
 *  ------------------------------------------------------------------------
 *  This file contains the full V2 sheet class structure, but EVERYTHING is
 *  commented out so it has zero effect on the running system.
 *
 *  When Foundry v16 arrives:
 *    1. Uncomment this file
 *    2. Update carwars.js to use these classes when USE_V2_SHEETS = true
 *    3. Begin migrating handlers into the V2 lifecycle
 *
 *  Until then, this file is inert and safe.
 * ========================================================================
 */

/*

// ========================================================================
// IMPORTS
// ========================================================================
import { ApplicationV2 } from "foundry/applications/api";

// ========================================================================
// VEHICLE SHEET (V2)
// ========================================================================
export class CarWarsVehicleSheetV2 extends ApplicationV2 {

  // ----------------------------------------------------------------------
  // DEFAULT OPTIONS (V2)
  // ----------------------------------------------------------------------
  static DEFAULT_OPTIONS = {
    id: "carwars-vehicle-sheet",
    classes: ["carwars", "sheet", "vehicle"],

    window: {
      title: "Car Wars Vehicle",
      icon: "fas fa-car"
    },

    position: {
      width: 900,
      height: 720
    },

    // V2 form submission handler
    form: {
      handler: this._onSubmit
    },

    // V2 event binding (replaces activateListeners)
    actions: {
      "change .construction-input": this._onConstructionChange,
      "click .apply-construction": this._onApplyConstruction,
      "click .clear-construction-preview": this._onClearConstructionPreview,

      "click .movement-control": this._onMovementControl,
      "change .maneuver-select": this._onManeuverSelect,
      "click .apply-maneuver": this._onManeuverButton,

      "click .weapon-fire": this._onWeaponFire,
      "click .weapon-reload": this._onWeaponReload,

      "click .armor-damage": this._onArmorDamage,
      "click .armor-repair": this._onArmorRepair,

      "click .crew-action": this._onCrewAction,
      "click .add-crew-member": this._onAddCrew,
      "click .remove-crew-member": this._onRemoveCrew,
      "click .crew-open-actor": this._onOpenCrewActor,
      "change .crew-role-select": this._onChangeCrewRole,
      "click .crew-remove-missing": this._onRemoveMissingCrew,

      "click .system-toggle": this._onSystemToggle
    }
  };

  // ----------------------------------------------------------------------
  // DATA MODEL (V2)
  // ----------------------------------------------------------------------
  async getData() {
    return {
      actor: this.actor,
      system: this.actor.system,
      editable: this.actor.isOwner,
      preview: this.preview ?? null
    };
  }

  // ----------------------------------------------------------------------
  // RENDERING (V2)
  // ----------------------------------------------------------------------
  async _renderFrame(options) {
    return await renderTemplate(
      "systems/carwars-system/templates/actor/vehicle-sheet.html",
      await this.getData()
    );
  }

  // ----------------------------------------------------------------------
  // FORM SUBMISSION (V2)
  // ----------------------------------------------------------------------
  async _onSubmit(event, formData) {
    // Example:
    // await this.actor.update({ system: formData.system });
  }

  // ----------------------------------------------------------------------
  // HANDLERS (to be migrated from V1)
  // ----------------------------------------------------------------------
  // _onConstructionChange(event) { ... }
  // _onApplyConstruction(event) { ... }
  // _onMovementControl(event) { ... }
  // _onWeaponFire(event) { ... }
  // _onWeaponReload(event) { ... }
  // _onCrewAction(event) { ... }
  // etc.
}

// ========================================================================
// DRIVER SHEET (V2)
// ========================================================================
export class CarWarsDriverSheetV2 extends ApplicationV2 {

  static DEFAULT_OPTIONS = {
    id: "carwars-driver-sheet",
    classes: ["carwars", "sheet", "driver"],

    window: {
      title: "Car Wars Driver",
      icon: "fas fa-id-card"
    },

    position: {
      width: 520,
      height: 520
    },

    form: {
      handler: this._onSubmit
    },

    actions: {
      "click .driver-action": this._onDriverAction
    }
  };

  async getData() {
    return {
      actor: this.actor,
      system: this.actor.system,
      editable: this.actor.isOwner
    };
  }

  async _renderFrame(options) {
    return await renderTemplate(
      "systems/carwars-system/templates/actor/driver-sheet.html",
      await this.getData()
    );
  }

  async _onSubmit(event, formData) {
    // No-op for now
  }

  _onDriverAction(event) {
    const action = event.currentTarget.dataset.action;
    ui.notifications.info(`Driver action: ${action}`);
  }
}

*/
