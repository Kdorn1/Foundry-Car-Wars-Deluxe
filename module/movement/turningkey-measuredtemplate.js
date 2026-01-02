// module/movement/turningkey-measuredtemplate.js
// ------------------------------------------------------------
// Custom MeasuredTemplate class for Turning Key arcs
// ------------------------------------------------------------

import { TemplateRenderer } from "./templates.js";
import { MANEUVERS } from "./maneuver-registry.js";
import { inchesToPixels } from "./movement-engine.js";

export class TurningKeyMeasuredTemplate extends MeasuredTemplate {

  // ------------------------------------------------------------
  // Override draw() to render a curved Turning Key arc
  // ------------------------------------------------------------
  async draw() {
    await super.draw();

    // Clear default ray graphics
    this.clear();

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

    // Geometry inputs
    const startX = this.document.x;
    const startY = this.document.y;
    const facing = token.rotation;
    const forwardPx = inchesToPixels(maneuver.footprint);

    const angleOffset = TemplateRenderer._getAngleOffset(maneuver, direction);

    // Legality color
    const color = TemplateRenderer._getLegalityColor(token, maneuver);

    // Draw the arc using the same renderer as previews
    const arc = TemplateRenderer._drawArc(startX, startY, facing, angleOffset, forwardPx, color);

    // Add PIXI graphics to template
    this.addChild(arc);

    return this;
  }

  // ------------------------------------------------------------
  // Override refresh() so arc updates during drag/rotate
  // ------------------------------------------------------------
  refresh() {
    super.refresh();
    this.draw();
  }
}


// ------------------------------------------------------------
// Register custom template type + class (Foundry V13+)
// ------------------------------------------------------------
//Hooks.once("init", () => {

  // 1. Register the template type key
  //CONST.MEASURED_TEMPLATE_TYPES.turningKey = "turningKey";

  // 2. Register the human-readable label
  //TEMPLATE.TYPES.turningKey = "Turning Key";

  // 3. Register the custom class for this type
  //CONFIG.MeasuredTemplate.objectClass.turningKey = TurningKeyMeasuredTemplate;

  //console.log("🔵 [TurningKey] Registered TurningKeyMeasuredTemplate (v13 compatible)");
//});
