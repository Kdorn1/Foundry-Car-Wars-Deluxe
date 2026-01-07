/**
 * Car Wars Driver Actor sheet
 * - Minimal driver sheet with attach/detach to vehicle support (UUID-based)
 * - Shows skills, equipment, damage, notes and simple actions
 */

export class CarWarsDriverSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["carwars", "sheet", "driver"],
      template: "systems/carwars-system/templates/actor/driver-sheet.html",
      width: 520,
      height: 520,
      resizable: true,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "overview"
        }
      ]
    });
  }

  get template() {
    return this.options.template;
  }

  /** Prepare data for the template */
  getData(options = {}) {
    const data = super.getData(options);
    data.system = this.actor.system ?? {};
    data.editable = this.isEditable;
    // Ensure fields exist for template safety
    data.system.skills = data.system.skills ?? [];
    data.system.equipment = data.system.equipment ?? [];
    data.system.damage = data.system.damage ?? 0;
    data.system.notes = data.system.notes ?? "";
    data.system.assigned = data.system.assigned ?? { vehicleUuid: null, role: null };
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;

    // Generic driver actions (kept for compatibility)
    html.find(".driver-action").on("click", this._onDriverAction.bind(this));

    // Attach / Detach controls
    html.find(".attach-to-vehicle").on("click", this._onAttachToVehicle.bind(this));
    html.find(".detach-from-vehicle").on("click", this._onDetachFromVehicle.bind(this));

    // Quick edit fields (skills/equipment/notes/damage)
    html.find("input[name], textarea[name], select[name]").on("change", this._onFieldChange.bind(this));
  }

  /* -----------------------------
     Field change handler
     ----------------------------- */
  async _onFieldChange(event) {
    event.preventDefault();
    const el = event.currentTarget;
    const name = el.name;
    const value = el.type === "number" ? Number(el.value) : el.value;
    // Build update object using expanded path
    const update = foundry.utils.expandObject({ [name]: value });
    try {
      await this.actor.update(update);
    } catch (err) {
      console.error("🟥 [carwars] Failed to update driver field:", err);
      ui.notifications?.error("Failed to update field.");
    }
  }

  /* -----------------------------
     Driver action (placeholder)
     ----------------------------- */
  _onDriverAction(event) {
    event.preventDefault();
    const action = event.currentTarget.dataset.action;
    ui.notifications?.info(`Driver action: ${action}`);
  }

  /* -----------------------------
     Attach to vehicle dialog
     - Presents a list of vehicle actors and role choices
     - Updates both driver.actor.system.assigned and vehicle.system.crew (push uuid+role)
     ----------------------------- */
  async _onAttachToVehicle(event) {
    event?.preventDefault?.();

    // Gather vehicle candidates
    const vehicles = game.actors?.contents?.filter(a => a.type === "vehicle") ?? [];
    if (!vehicles.length) {
      ui.notifications?.warn("No vehicle actors available to attach to.");
      return;
    }

    const actorOptions = vehicles.map(v => `<option value="${v.uuid}">${v.name}</option>`).join("");
    const content = `
      <form>
        <div class="form-group">
          <label>Select Vehicle</label>
          <select id="select-vehicle">${actorOptions}</select>
        </div>
        <div class="form-group">
          <label>Role</label>
          <select id="select-role">
            <option value="driver">Driver</option>
            <option value="gunner">Gunner</option>
            <option value="passenger">Passenger</option>
          </select>
        </div>
        <div class="form-group">
          <label>Replace existing occupant?</label>
          <select id="select-replace">
            <option value="no">No</option>
            <option value="yes">Yes (if role occupied)</option>
          </select>
        </div>
      </form>
    `;

    return new Promise((resolve) => {
      new Dialog({
        title: "Attach to Vehicle",
        content,
        buttons: {
          attach: {
            icon: "<i class='fas fa-link'></i>",
            label: "Attach",
            callback: async (html) => {
              const vehicleUuid = html.find("#select-vehicle").val();
              const role = html.find("#select-role").val() || "passenger";
              const replaceIfOccupied = html.find("#select-replace").val() === "yes";

              if (!vehicleUuid) {
                ui.notifications?.warn("No vehicle selected.");
                resolve(false);
                return;
              }

              try {
                // Resolve vehicle actor
                const vehicle = await fromUuid(vehicleUuid);
                if (!vehicle) {
                  ui.notifications?.error("Selected vehicle could not be found.");
                  resolve(false);
                  return;
                }

                // Update vehicle.system.crew safely
                const currentCrew = foundry.utils.deepClone(vehicle.system?.crew ?? []);
                // If role is unique (driver) and occupied, optionally replace
                if (!replaceIfOccupied && role === "driver") {
                  const occupied = currentCrew.find(c => c.role === "driver");
                  if (occupied) {
                    ui.notifications?.warn("Vehicle already has a driver. Choose replace option to override.");
                    resolve(false);
                    return;
                  }
                }
                // If replace requested, remove existing same-role entry
                if (replaceIfOccupied) {
                  for (let i = currentCrew.length - 1; i >= 0; i--) {
                    if (currentCrew[i].role === role) currentCrew.splice(i, 1);
                  }
                }
                // Prevent duplicate uuid entries
                const already = currentCrew.find(c => c.uuid === this.actor.uuid && c.role === role);
                if (!already) currentCrew.push({ uuid: this.actor.uuid, role });

                // Update vehicle and driver assigned info in parallel
                await vehicle.update({ "system.crew": currentCrew });
                await this.actor.update({ "system.assigned": { vehicleUuid, role } });

                ui.notifications?.info(`${this.actor.name} attached to ${vehicle.name} as ${role}.`);
                resolve(true);
              } catch (err) {
                console.error("🟥 [carwars] Failed to attach driver to vehicle:", err);
                ui.notifications?.error("Failed to attach to vehicle.");
                resolve(false);
              }
            }
          },
          cancel: {
            icon: "<i class='fas fa-times'></i>",
            label: "Cancel",
            callback: () => resolve(false)
          }
        },
        default: "attach"
      }).render(true);
    });
  }

  /* -----------------------------
     Detach from vehicle
     - Removes this actor's uuid entry from the vehicle.system.crew
     - Clears this.actor.system.assigned
     ----------------------------- */
  async _onDetachFromVehicle(event) {
    event?.preventDefault?.();
    const assigned = this.actor.system?.assigned ?? {};
    const vehicleUuid = assigned.vehicleUuid ?? null;
    if (!vehicleUuid) {
      ui.notifications?.warn("This driver is not attached to any vehicle.");
      return;
    }

    try {
      const vehicle = await fromUuid(vehicleUuid);
      if (!vehicle) {
        // Still clear assigned info if vehicle missing
        await this.actor.update({ "system.assigned": { vehicleUuid: null, role: null } });
        ui.notifications?.warn("Vehicle not found; cleared assignment.");
        return;
      }

      const currentCrew = foundry.utils.deepClone(vehicle.system?.crew ?? []);
      const filtered = currentCrew.filter(c => c.uuid !== this.actor.uuid);
      await vehicle.update({ "system.crew": filtered });
      await this.actor.update({ "system.assigned": { vehicleUuid: null, role: null } });

      ui.notifications?.info(`${this.actor.name} detached from ${vehicle.name}.`);
    } catch (err) {
      console.error("🟥 [carwars] Failed to detach driver from vehicle:", err);
      ui.notifications?.error("Failed to detach from vehicle.");
    }
  }
}
