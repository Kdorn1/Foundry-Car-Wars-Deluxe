/**
 * Car Wars ActorSheet implementations
 * - CarWarsVehicleSheet: full multi-tab vehicle sheet with construction preview plumbing
 * - CarWarsDriverSheet: minimal driver sheet
 *
 * Notes:
 * - getData() is async to resolve crew UUIDs into plain objects (crewActor) for templates.
 * - See the bottom of this file for a short V2 migration checklist and compatibility notes.
 */

const IS_V2 = !!(foundry?.applications?.api?.ApplicationV2);

function logSheet(msg, ...args) {
  const ts = new Date().toISOString().split("T")[1].replace("Z", "");
  console.log(`🟦 [carwars-sheet ${ts}] ${msg}`, ...args);
}

export class CarWarsVehicleSheet extends ActorSheet {

  constructor(...args) {
    super(...args);
    this.preview = null; // construction preview
  }

  /** Default sheet options */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["carwars", "sheet", "vehicle"],
      template: "systems/carwars-system/templates/actor/vehicle-sheet.html",

      width: 900,
      height: 720,
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

  /**
   * Prepare data for the template
   * - Async so we can resolve UUIDs (fromUuid) and pass plain objects into Handlebars.
   */
  async getData(options = {}) {
    // Allow the parent to prepare its data (super.getData can be async)
    const context = await super.getData(options);

    context.system = this.actor.system ?? {};
    context.editable = this.isEditable;
    context.preview = this.preview ?? null;

    // Ensure crew arrays exist for templates and are arrays
    if (!Array.isArray(context.system.crew)) {
      console.warn("carwars | actor.system.crew is not an array — coercing. Value:", context.system.crew);
      context.system.crew = Array.isArray(context.system.crew) ? context.system.crew : [];
    }
    if (!Array.isArray(context.system.crewOccupants)) {
      context.system.crewOccupants = Array.isArray(context.system.crewOccupants) ? context.system.crewOccupants : [];
    }

    // Resolve each crew entry's UUID to a plain object for templates (safe guard)
    try {
      const crewResolved = await Promise.all(context.system.crew.map(async (entry) => {
        if (!entry || typeof entry !== "object") return { ...(entry || {}), crewActor: null };

        const uuid = entry.uuid;
        if (!uuid) return { ...entry, crewActor: null };

        try {
          const doc = await fromUuid(uuid);
          const crewActorObj = (doc && typeof doc.toObject === "function") ? doc.toObject() : (doc ?? null);
          return { ...entry, crewActor: crewActorObj };
        } catch (err) {
          console.warn("carwars | Failed to resolve crew uuid:", uuid, err);
          return { ...entry, crewActor: null };
        }
      }));

      context.system.crew = crewResolved;
    } catch (err) {
      console.error("carwars | Error resolving crew entries:", err);
      // Fallback: ensure crew is an array of plain entries with crewActor:null
      context.system.crew = (Array.isArray(context.system.crew) ? context.system.crew : []).map(e => ({ ...(e || {}), crewActor: null }));
    }

    // Legacy alias
    context.actorData = context.actor?.data ?? {};

    return context;
  }

  /** Update preview and re-render */
  updatePreview(preview) {
    this.preview = preview;
    this.render(false);
  }

  /** Activate listeners */
  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;

    // ============================================================
    // CONSTRUCTION TAB
    // ============================================================
    html.find(".construction-input").on("change", this._onConstructionChange.bind(this));
    html.find(".apply-construction").on("click", this._onApplyConstruction.bind(this));
    html.find(".clear-construction-preview").on("click", this._onClearConstructionPreview.bind(this));

    // ============================================================
    // MOVEMENT CONTROLS
    // ============================================================
    html.find(".movement-control").on("click", this._onMovementControl.bind(this));

    // Maneuver selection + apply
    html.find(".maneuver-select").on("change", this._onManeuverSelect.bind(this));
    html.find(".apply-maneuver").on("click", this._onManeuverButton.bind(this));

    // Control roll (optional)
    if (this._onControlRoll) html.find(".control-roll").on("click", this._onControlRoll.bind(this));

    // Speed controls
    html.find(".speed-up").on("click", (ev) =>
      this._onMovementControl({ ...ev, currentTarget: { dataset: { action: "speed-up" }}})
    );
    html.find(".speed-down").on("click", (ev) =>
      this._onMovementControl({ ...ev, currentTarget: { dataset: { action: "speed-down" }}})
    );

    // Hazard controls
    html.find(".hazard-up").on("click", (ev) =>
      this._onMovementControl({ ...ev, currentTarget: { dataset: { action: "hazard-up" }}})
    );
    html.find(".hazard-down").on("click", (ev) =>
      this._onMovementControl({ ...ev, currentTarget: { dataset: { action: "hazard-down" }}})
    );

    // Phase controls
    html.find(".phase-prev").on("click", (ev) =>
      this._onMovementControl({ ...ev, currentTarget: { dataset: { action: "phase-prev" }}})
    );
    html.find(".phase-next").on("click", (ev) =>
      this._onMovementControl({ ...ev, currentTarget: { dataset: { action: "phase-next" }}})
    );

    // ============================================================
    // TURNING KEY
    // ============================================================
    html.find(".tk-btn").on("click", (ev) => {
      const btn = ev.currentTarget;
      this._onTurningKeyClick(btn.dataset.maneuver, btn.dataset.direction);
    });

    html.find(".tk-spawn").on("click", this._onTurningKeySpawn.bind(this));
    html.find(".tk-clear").on("click", this._onTurningKeyClear.bind(this));

    // ============================================================
    // ARMOR
    // ============================================================
    html.find(".armor-damage").on("click", this._onArmorDamage.bind(this));
    html.find(".armor-repair").on("click", this._onArmorRepair.bind(this));

    // ============================================================
    // WEAPONS
    // ============================================================
    html.find(".weapon-fire").on("click", this._onWeaponFire.bind(this));
    html.find(".weapon-reload").on("click", this._onWeaponReload.bind(this));

    // ============================================================
    // CREW
    // ============================================================
    // Generic crew action handler (keeps compatibility with existing markup)
    html.find(".crew-action").on("click", this._onCrewAction.bind(this));
    // Add / Remove crew controls
    html.find(".add-crew-member").on("click", this._onAddCrew.bind(this));
    html.find(".remove-crew-member").on("click", this._onRemoveCrew.bind(this));

    // New crew-role partial handlers
    // Open linked actor sheet
    html.find(".crew-open-actor").on("click", this._onOpenCrewActor.bind(this));
    // Role change select
    html.find(".crew-role-select").on("change", this._onChangeCrewRole.bind(this));
    // Remove missing link button
    html.find(".crew-remove-missing").on("click", this._onRemoveMissingCrew.bind(this));
    // Detach / Remove from partial (keeps compatibility)
    html.find(".crew-detach").on("click", this._onRemoveCrew.bind(this));

    // ============================================================
    // SYSTEMS
    // ============================================================
    html.find(".system-toggle").on("change", this._onSystemToggle.bind(this));
  }

  // ========================================================================
  //  CONSTRUCTION HANDLERS
  // ========================================================================
  async _onConstructionChange(event) {
    event.preventDefault();

    const form = this.form;
    const formData = new FormData(form);
    const expanded = foundry.utils.expandObject(Object.fromEntries(formData));

    const constructionData = expanded.system?.construction ?? expanded.system ?? {};

    const engine = game.carwars?.construction ?? game.carwarsConstruction ?? null;

    if (engine?.previewBuild) {
      try {
        const preview = await engine.previewBuild(this.actor, constructionData);
        this.updatePreview(preview);
      } catch (err) {
        console.error("🟥 [carwars] Construction preview failed:", err);
        ui.notifications?.error("Car Wars construction preview failed.");
      }
    } else {
      const currentSystem = foundry.utils.deepClone(this.actor.system ?? {});
      const preview = foundry.utils.mergeObject(
        currentSystem,
        { construction: constructionData },
        { inplace: false }
      );
      this.updatePreview(preview);
    }
  }

  async _onApplyConstruction(event) {
    event.preventDefault();
    if (!this.preview) {
      ui.notifications?.warn("No construction changes to apply.");
      return;
    }

    try {
      await this.actor.update({ system: this.preview });
      this.preview = null;
      this.render();
      ui.notifications?.info("Construction applied.");
    } catch (err) {
      console.error("🟥 [carwars] Failed to apply construction:", err);
      ui.notifications?.error("Failed to apply construction.");
    }
  }

  async _onClearConstructionPreview(event) {
    event.preventDefault();
    this.preview = null;
    this.render(false);
  }

  // ========================================================================
  //  MOVEMENT HANDLERS
  // ========================================================================
  async _onMovementControl(event) {
    event.preventDefault();
    const action = event.currentTarget.dataset.action;
    const engine = game.carwars?.movement ?? game.carwarsMovement ?? null;

    if (!engine?.handleControl) return;

    try {
      await engine.handleControl(this.actor, action);
    } catch (err) {
      console.error("🟥 [carwars] Movement control failed:", err);
      ui.notifications?.error("Movement control failed.");
    }
  }

  async _onManeuverSelect(event) {
    event.preventDefault();
    const value = event.currentTarget.value;
    const engine = game.carwars?.movement ?? game.carwarsMovement ?? null;

    if (!engine?.selectManeuver) return;

    try {
      await engine.selectManeuver(this.actor, value);
    } catch (err) {
      console.error("🟥 [carwars] Maneuver selection failed:", err);
      ui.notifications?.error("Maneuver selection failed.");
    }
  }

  async _onManeuverButton(event) {
    event.preventDefault();
    const maneuver = event.currentTarget.dataset.maneuver;
    const engine = game.carwars?.movement ?? game.carwarsMovement ?? null;

    if (!engine?.performManeuver) return;

    try {
      await engine.performManeuver(this.actor, maneuver);
    } catch (err) {
      console.error("🟥 [carwars] Perform maneuver failed:", err);
      ui.notifications?.error("Perform maneuver failed.");
    }
  }

  // ========================================================================
  //  TURNING KEY
  // ========================================================================
  async _onTurningKeyClick(maneuver, direction) {
    const tk = globalThis.TurningKeyTemplate ?? globalThis.turningKeyTemplate ?? null;

    if (!tk?.placeInteractive) {
      ui.notifications?.warn("Turning Key tool unavailable.");
      return;
    }

    try {
      const token = this.token ?? canvas.tokens.controlled[0];
      if (!token) return ui.notifications.warn("Select a vehicle token first.");
      await tk.placeInteractive(token, maneuver, direction);
    } catch (err) {
      console.error("🟥 [carwars] TurningKeyTemplate failed:", err);
      ui.notifications?.error("Turning Key action failed.");
    }
  }

  async _onTurningKeySpawn(event) {
    event.preventDefault();
    const variant = event.currentTarget.dataset.variant ?? "tk1";
    const helper = game.carwars?.turningKey ?? game.carwarsTurningKey ?? null;

    if (!helper?.spawnTile) return;

    try {
      const token = this.token ?? canvas.tokens.controlled[0];
      if (!token) return ui.notifications.warn("Select a vehicle token first.");
      await helper.spawnTile(token, variant);
    } catch (err) {
      console.error("🟥 [carwars] TK spawn failed:", err);
      ui.notifications?.error("Turning Key tile spawn failed.");
    }
  }

  async _onTurningKeyClear(event) {
    event.preventDefault();
    const helper = game.carwars?.turningKey ?? game.carwarsTurningKey ?? null;

    if (!helper?.clearTiles) return;

    try {
      await helper.clearTiles();
    } catch (err) {
      console.error("🟥 [carwars] TK clear failed:", err);
      ui.notifications?.error("Turning Key tile clear failed.");
    }
  }

  // ========================================================================
  //  ARMOR
  // ========================================================================
  async _onArmorDamage(event) {
    event.preventDefault();
    const el = event.currentTarget;
    const location = el.dataset.location;
    const amount = Number(el.dataset.amount ?? 0);
    const engine = game.carwars?.armor ?? game.carwarsArmor ?? null;

    if (!engine?.applyDamage) return;

    try {
      await engine.applyDamage(this.actor, location, amount);
    } catch (err) {
      console.error("🟥 [carwars] Armor damage failed:", err);
      ui.notifications?.error("Armor damage failed.");
    }
  }

  async _onArmorRepair(event) {
    event.preventDefault();
    const el = event.currentTarget;
    const location = el.dataset.location;
    const amount = Number(el.dataset.amount ?? 0);
    const engine = game.carwars?.armor ?? game.carwarsArmor ?? null;

    if (!engine?.repair) return;

    try {
      await engine.repair(this.actor, location, amount);
    } catch (err) {
      console.error("🟥 [carwars] Armor repair failed:", err);
      ui.notifications?.error("Armor repair failed.");
    }
  }

  // ========================================================================
  //  WEAPONS
  // ========================================================================
  async _onWeaponFire(event) {
    event.preventDefault();
    const weaponId = event.currentTarget.dataset.weaponId;
    const engine = game.carwars?.weapons ?? game.carwarsWeapons ?? null;

    if (!engine?.fire) return;

    try {
      await engine.fire(this.actor, weaponId);
    } catch (err) {
      console.error("🟥 [carwars] Weapon fire failed:", err);
      ui.notifications?.error("Weapon fire failed.");
    }
  }

  async _onWeaponReload(event) {
    event.preventDefault();
    const weaponId = event.currentTarget.dataset.weaponId;
    const engine = game.carwars?.weapons ?? game.carwarsWeapons ?? null;

    if (!engine?.reload) return;

    try {
      await engine.reload(this.actor, weaponId);
    } catch (err) {
      console.error("🟥 [carwars] Weapon reload failed:", err);
      ui.notifications?.error("Weapon reload failed.");
    }
  }

  // ========================================================================
  //  CREW
  // ========================================================================
  async _onCrewAction(event) {
    event.preventDefault();
    const action = event.currentTarget.dataset.action;
    const role = event.currentTarget.dataset.role;
    const engine = game.carwars?.crew ?? game.carwarsCrew ?? null;

    if (!engine?.action) return;

    try {
      await engine.action(this.actor, role, action);
    } catch (err) {
      console.error("🟥 [carwars] Crew action failed:", err);
      ui.notifications?.error("Crew action failed.");
    }
  }

  /**
   * Open a dialog to add a crew member by selecting an existing Actor (by UUID)
   * and assigning a role (driver/gunner).
   */
  async _onAddCrew(event) {
    event?.preventDefault?.();

    // Build actor options: prefer actor types likely to be drivers (driver, character, pc)
    const candidates = game.actors?.contents?.filter(a =>
      ["driver", "character", "pc", "npc"].includes(a.type)
    ) ?? [];

    const actorOptions = candidates.map(a => `<option value="${a.uuid}">${a.name} (${a.type})</option>`).join("");
    const content = `
      <form>
        <div class="form-group">
          <label>Select Actor</label>
          <select id="select-actor">${actorOptions}</select>
        </div>
        <div class="form-group">
          <label>Role</label>
          <select id="select-role">
            <option value="driver">Driver</option>
            <option value="gunner">Gunner</option>
            <option value="passenger">Passenger</option>
          </select>
        </div>
      </form>
    `;

    return new Promise((resolve) => {
      new Dialog({
        title: "Add Crew Member",
        content,
        buttons: {
          add: {
            icon: "<i class='fas fa-check'></i>",
            label: "Add",
            callback: async (html) => {
              const uuid = html.find("#select-actor").val();
              const role = html.find("#select-role").val() || "passenger";
              if (!uuid) {
                ui.notifications?.warn("No actor selected.");
                resolve(false);
                return;
              }

              const currentCrew = foundry.utils.deepClone(this.actor.system?.crew ?? []);
              currentCrew.push({ uuid, role });
              try {
                await this.actor.update({ "system.crew": currentCrew });
                resolve(true);
              } catch (err) {
                console.error("🟥 [carwars] Failed to add crew member:", err);
                ui.notifications?.error("Failed to add crew member.");
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
        default: "add"
      }).render(true);
    });
  }

  /**
   * Remove a crew member by index from system.crew
   */
  async _onRemoveCrew(event) {
    event?.preventDefault?.();
    const index = Number(event.currentTarget.dataset.index);
    if (Number.isNaN(index)) return;

    const currentCrew = foundry.utils.deepClone(this.actor.system?.crew ?? []);
    if (index < 0 || index >= currentCrew.length) return;

    currentCrew.splice(index, 1);
    try {
      await this.actor.update({ "system.crew": currentCrew });
    } catch (err) {
      console.error("🟥 [carwars] Failed to remove crew member:", err);
      ui.notifications?.error("Failed to remove crew member.");
    }
  }

  /**
   * Open the linked actor sheet for a crew member (fromUuid)
   */
  async _onOpenCrewActor(event) {
    event?.preventDefault();
    const uuid = event.currentTarget.dataset.uuid;
    if (!uuid) return;
    try {
      const doc = await fromUuid(uuid);
      if (!doc) {
        ui.notifications?.warn("Linked actor not found.");
        return;
      }
      // If it's an Actor document, open its sheet; otherwise try to open the document's sheet if available
      if (doc instanceof Actor) {
        await doc.sheet.render(true);
      } else if (doc.sheet) {
        await doc.sheet.render(true);
      } else {
        ui.notifications?.warn("No sheet available for linked document.");
      }
    } catch (err) {
      console.error("🟥 [carwars] Failed to open linked actor:", err);
      ui.notifications?.error("Failed to open linked actor.");
    }
  }

  /**
   * Change the role for a crew entry by index
   */
  async _onChangeCrewRole(event) {
    event?.preventDefault?.();
    const idx = Number(event.currentTarget.dataset.index);
    const newRole = event.currentTarget.value;
    if (Number.isNaN(idx)) return;

    const currentCrew = foundry.utils.deepClone(this.actor.system?.crew ?? []);
    if (idx < 0 || idx >= currentCrew.length) return;

    currentCrew[idx].role = newRole;
    try {
      await this.actor.update({ "system.crew": currentCrew });
    } catch (err) {
      console.error("🟥 [carwars] Failed to change crew role:", err);
      ui.notifications?.error("Failed to change crew role.");
    }
  }

  /**
   * Remove a missing link entry (when crewActor was not resolved)
   */
  async _onRemoveMissingCrew(event) {
    event?.preventDefault();
    const idx = Number(event.currentTarget.dataset.index);
    if (Number.isNaN(idx)) return;

    const currentCrew = foundry.utils.deepClone(this.actor.system?.crew ?? []);
    if (idx < 0 || idx >= currentCrew.length) return;

    currentCrew.splice(idx, 1);
    try {
      await this.actor.update({ "system.crew": currentCrew });
    } catch (err) {
      console.error("🟥 [carwars] Failed to remove missing crew link:", err);
      ui.notifications?.error("Failed to remove missing crew link.");
    }
  }

  // ========================================================================
  //  SYSTEMS
  // ========================================================================
  async _onSystemToggle(event) {
    event.preventDefault();
    const systemKey = event.currentTarget.dataset.system;
    const value = event.currentTarget.checked;
    const engine = game.carwars?.systems ?? game.carwarsSystems ?? null;

    if (!engine?.toggle) return;

    try {
      await engine.toggle(this.actor, systemKey, value);
    } catch (err) {
      console.error("🟥 [carwars] System toggle failed:", err);
      ui.notifications?.error("System toggle failed.");
    }
  }
}

/**
 * Driver sheet remains simple
 */
export class CarWarsDriverSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["carwars", "sheet", "driver"],
      template: "systems/carwars-system/templates/actor/driver-sheet.html",

      width: 520,
      height: 520,
      resizable: true
    });
  }

  get template() {
    return this.options.template;
  }

  getData(options = {}) {
    const data = super.getData(options);
    data.actorData = data.actor?.data ?? {};
    data.system = this.actor.system ?? {};
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;

    html.find(".driver-action").on("click", (ev) => {
      const action = ev.currentTarget.dataset.action;
      ui.notifications.info(`Driver action: ${action}`);
    });
  }
}

/* ------------------------------------------------------------------
   V2 Migration notes and checklist (developer-facing)
   ------------------------------------------------------------------
   Foundry is deprecating the V1 Application framework. The console
   will warn about ActorSheet usage. This file continues to extend
   ActorSheet (V1) for compatibility.

   Short-term: keep using ActorSheet; add clear logs and tests.
   Long-term: migrate to Application V2 API before Foundry v16.

   Minimal migration checklist:
   1. Replace `extends ActorSheet` with the V2-compatible base (see Foundry docs).
   2. Update lifecycle method signatures:
      - `getData` remains async-capable but confirm V2 signature.
      - `activateListeners` may be replaced by V2 event binding patterns.
   3. Replace `defaultOptions` with the V2 options object shape if changed.
   4. Update any direct references to `foundry.applications.*` APIs to their V2 equivalents.
   5. Run full UI tests: sheet rendering, event handlers, token interactions.
   6. Consider providing a compatibility shim for older Foundry versions if you need to support both.
   ------------------------------------------------------------------ */
