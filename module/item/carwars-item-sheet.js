// module/item/carwars-item-sheet.js
// Clean, modern Foundry V12+ item sheet for Car Wars

export class CarWarsItemSheet extends foundry.applications.sheets.ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["carwars", "sheet", "item"],
      width: 600,
      height: 400,
      resizable: true
    });
  }

  get template() {
    const type = this.item?.type ?? "item";
    return `systems/carwars-system/templates/item/${type}-sheet.html`;
  }

  async getData(options) {
    const data = await super.getData(options);
    data.item = this.item;
    data.system = this.item.system;
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;

    // Add item-specific listeners here if needed
  }
}
