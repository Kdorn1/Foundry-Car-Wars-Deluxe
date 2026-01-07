// module/movement/turningkey-measuredtemplate.js
// ------------------------------------------------------------
// Custom MeasuredTemplate class for Turning Key arcs
// ------------------------------------------------------------

import { TemplateRenderer } from "./templates.js";
import { MANEUVERS } from "./maneuver-registry.js";
import { inchesToPixels } from "./movement-engine.js";

// Use the v13+ namespaced MeasuredTemplate
export class TurningKeyMeasuredTemplate extends foundry.canvas.placeables.MeasuredTemplate {

  // ------------------------------------------------------------
  // Override draw() to render a curved Turning Key arc
  // ------------------------------------------------------------
  async draw() {
    await super.draw();

    const maneuverId = this.document.getFlag("carwars-system", "maneuverId");
    const direction = this.document.getFlag("carwars-system", "direction");
    const tokenId = this.document.getFlag("carwars-system", "tokenId");

    const token = canvas.tokens.get(tokenId);
    if (!token) {
      console.warn("[TurningKey] No token found for template draw()");
      return this;
    }

    const maneuver = MANEUVERS[maneuverId];
    if (!maneuver) {
      console.warn("[TurningKey] Unknown maneuver:", maneuverId);
      return this;
    }

    // Geometry inputs — MUST MATCH TemplateRenderer.previewManeuver
    const startX = token.center.x;
    const startY = token.center.y;
    const facing = token.rotation;
    const forwardPx = inchesToPixels(maneuver.footprint);

    const angleOffset = TemplateRenderer._getAngleOffset(maneuver, direction);

    // Legality color
    const color = TemplateRenderer._getLegalityColor(token, maneuver);

    // Draw the arc using the same renderer as previews
    const arc = TemplateRenderer._drawArc(startX, startY, facing, angleOffset, forwardPx, color);

    // Clear any existing children and add PIXI graphics to template
    this.removeChildren();
    this.addChild(arc);

    return this;
  }

  // ------------------------------------------------------------
  // IMPORTANT: Do NOT override refresh()
  // Foundry handles refresh → draw lifecycle correctly.
  // ------------------------------------------------------------
}


// ------------------------------------------------------------
// Register custom template type + class (Foundry V13+)
// ------------------------------------------------------------
Hooks.once("init", () => {

  // Register the custom class for this template type
  CONFIG.MeasuredTemplate.objectClass.turningKey = TurningKeyMeasuredTemplate;

  console.log("🔵 [TurningKey] Registered TurningKeyMeasuredTemplate (v13 compatible)");
});
