/**
 * ========================================================================
 *  Car Wars — ApplicationV2 Item Sheet Skeleton (Commented Out)
 *  ------------------------------------------------------------------------
 *  This file contains the full V2 item sheet class structure, but EVERYTHING
 *  is commented out so it has zero effect on the running system.
 *
 *  When Foundry v16 arrives:
 *    1. Uncomment this file
 *    2. Update carwars.js to use CarWarsItemSheetV2 when USE_V2_SHEETS = true
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
// ITEM SHEET (V2)
// ========================================================================
export class CarWarsItemSheetV2 extends ApplicationV2 {

  // ----------------------------------------------------------------------
  // DEFAULT OPTIONS (V2)
  // ----------------------------------------------------------------------
  static DEFAULT_OPTIONS = {
    id: "carwars-item-sheet",
    classes: ["carwars", "sheet", "item"],

    window: {
      title: "Car Wars Item",
      icon: "fas fa-cog"
    },

    position: {
      width: 600,
      height: 500
    },

    // V2 form submission handler
    form: {
      handler: this._onSubmit
    },

    // V2 event binding (replaces activateListeners)
    actions: {
      "click .item-action": this._onItemAction,
      "change .item-field": this._onItemFieldChange
    }
  };

  // ----------------------------------------------------------------------
  // DATA MODEL (V2)
  // ----------------------------------------------------------------------
  async getData() {
    return {
      item: this.item,
      system: this.item.system,
      editable: this.item.isOwner
    };
  }

  // ----------------------------------------------------------------------
  // RENDERING (V2)
  // ----------------------------------------------------------------------
  async _renderFrame(options) {
    return await renderTemplate(
      "systems/carwars-system/templates/item/item-sheet.html",
      await this.getData()
    );
  }

  // ----------------------------------------------------------------------
  // FORM SUBMISSION (V2)
  // ----------------------------------------------------------------------
  async _onSubmit(event, formData) {
    // Example:
    // await this.item.update({ system: formData.system });
  }

  // ----------------------------------------------------------------------
  // HANDLERS (to be migrated from V1)
  // ----------------------------------------------------------------------
  _onItemAction(event) {
    const action = event.currentTarget.dataset.action;
    ui.notifications.info(`Item action: ${action}`);
  }

  _onItemFieldChange(event) {
    const field = event.currentTarget.name;
    const value = event.currentTarget.value;
    console.log(`Item field changed: ${field} = ${value}`);
  }
}

*/
