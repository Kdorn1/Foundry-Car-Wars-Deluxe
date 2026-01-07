// ------------------------------------------------------------
// CATALOG LOADER — Full Catalog Integration with Preload (v1.1)
// ------------------------------------------------------------

function log(msg, ...args) {
  const ts = new Date().toISOString().split("T")[1].replace("Z", "");
  console.log(`🟪 [carwars ${ts}] CatalogLoader: ${msg}`, ...args);
}

export const CatalogLoader = {
  _cache: {},

  // ------------------------------------------------------------
  // Load a single catalog file (safe)
  // ------------------------------------------------------------
  async _loadFile(path) {
    try {
      log(`Loading catalog: ${path}`);
      const response = await fetch(path);
      if (!response.ok) {
        log(`⚠️ Catalog missing or failed to load: ${path}`);
        return {};
      }
      const data = await response.json();
      log(`Loaded catalog: ${path}`, data);
      return data;
    } catch (err) {
      log(`❌ Error loading catalog ${path}:`, err);
      return {};
    }
  },

  // ------------------------------------------------------------
  // Load all catalogs (bodies, weapons, accessories, etc.)
  // ------------------------------------------------------------
  async loadAll() {
    log("Loading all catalogs…");

    const base = "systems/carwars-system/data/";

    const files = {
      accessories: "accessories.json",
      armor: "armor.json",
      bodies: "bodies.json",
      chassis: "chassis.json",
      engineMods: "engine-mods.json",
      gasTanks: "gas-tanks.json",
      powerplants: "powerplants.json",
      suspension: "suspension.json",
      tireOptions: "tire-options.json",
      tires: "tires.json",
      weapons: "weapons.json"
    };

    const entries = Object.entries(files);

    for (const [key, file] of entries) {
      this._cache[key] = await this._loadFile(base + file);
    }

    log("All catalogs loaded:", this._cache);
    return this._cache;
  },

  // ------------------------------------------------------------
  // Get a single catalog by name
  // ------------------------------------------------------------
  get(name) {
    return this._cache[name] ?? {};
  },

  // ------------------------------------------------------------
  // Get all catalogs
  // ------------------------------------------------------------
  getAll() {
    return this._cache;
  },

  // ------------------------------------------------------------
  // Force reload
  // ------------------------------------------------------------
  async reload() {
    log("Reloading all catalogs…");
    this._cache = {};
    return await this.loadAll();
  }
};
