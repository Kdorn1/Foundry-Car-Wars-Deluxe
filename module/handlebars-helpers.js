// module/handlebars-helpers.js
// Register Handlebars helpers required by templates (run on Foundry init)

Hooks.once("init", () => {
  try {
    const HB = foundry?.applications?.handlebars ?? window?.Handlebars ?? (typeof Handlebars !== "undefined" ? Handlebars : null);
    if (!HB || typeof HB.registerHelper !== "function") {
      console.warn("🟨 [carwars] Handlebars not available to register helpers on init.");
      return;
    }

    // Register a simple range helper if not already present
    if (!HB.helpers?.range) {
      HB.registerHelper("range", function (start, end, options) {
        // Support {{#range n}} and {{#range start end}}
        if (arguments.length === 2) {
          options = end;
          end = start;
          start = 0;
        }
        start = Number(start) || 0;
        end = Number(end) || 0;
        const out = [];
        for (let i = start; i < end; i++) out.push(i);
        if (options && typeof options.fn === "function") {
          return out.map((v, idx) => options.fn(v, { data: { index: idx } })).join("");
        }
        return out;
      });
      console.log("🟦 [carwars] Registered Handlebars helper: range (on init)");
    } else {
      console.log("🟦 [carwars] Handlebars helper 'range' already present.");
    }
  } catch (err) {
    console.warn("🟨 [carwars] Could not register Handlebars helpers on init:", err);
  }
});
