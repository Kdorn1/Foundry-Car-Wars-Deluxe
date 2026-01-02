// module/movement/templates.js
// ------------------------------------------------------------
// Car Wars Deluxe Edition — Turning Key Template Renderer
// Step B: Curved Arc Rendering (Option A+)
// ------------------------------------------------------------

import { MANEUVERS } from "./maneuver-registry.js";
import { inchesToPixels } from "./movement-engine.js";
import { getControlModifier } from "./control-table.js";
import { TurningKeyTemplate } from "./turningkey-template.js";


export class TemplateRenderer {

  static activePreview = null;

  static previewManeuver(token, maneuverId, direction = "left") {
    if (!token) {
      console.warn("[TurningKey] No token selected.");
      return;
    }

    const maneuver = MANEUVERS[maneuverId];
    if (!maneuver) {
      console.warn(`[TurningKey] Unknown maneuver: ${maneuverId}`);
      return;
    }

    console.log(`[TurningKey] Rendering preview for maneuver: ${maneuver.name}`);

    this.clear();

    const forwardPx = inchesToPixels(maneuver.footprint);
    const startX = token.center.x;
    const startY = token.center.y;
    const facing = token.rotation;

    const angleOffset = this._getAngleOffset(maneuver, direction);
    const finalAngle = facing + angleOffset;

    const color = this._getLegalityColor(token, maneuver);

    // Draw curved arc instead of straight line
    const preview = this._drawArc(startX, startY, facing, angleOffset, forwardPx, color);

    canvas.stage.addChild(preview);
    this.activePreview = preview;

    console.log("[TurningKey] Preview rendered.");
  }

  static clear() {
    if (this.activePreview) {
      this.activePreview.destroy();
      this.activePreview = null;
    }
  }

  // ------------------------------------------------------------
  // Step B: Curved Arc Rendering
  // ------------------------------------------------------------
  static _drawArc(startX, startY, facing, angleOffset, forwardPx, color) {
    const preview = new PIXI.Graphics();
    preview.lineStyle(4, color, 0.9);

    // Convert angles to radians
    const startRad = (facing * Math.PI) / 180;
    const endRad = ((facing + angleOffset) * Math.PI) / 180;

    // Approximate radius: footprint * 1.5 gives a nice curve
    const radius = forwardPx * 1.5;

    // Arc center offset 90° to the left or right of facing
    const side = angleOffset > 0 ? 1 : -1;
    const centerX = startX + Math.cos(startRad + side * Math.PI / 2) * radius;
    const centerY = startY + Math.sin(startRad + side * Math.PI / 2) * radius;

    console.log(`[TurningKey] Arc center: (${centerX}, ${centerY})`);
    console.log(`[TurningKey] Arc radius: ${radius}`);

    preview.arc(
      centerX,
      centerY,
      radius,
      startRad,
      endRad,
      angleOffset < 0 // clockwise if turning left
    );

    return preview;
  }

  // ------------------------------------------------------------
  // Angle offset logic (Option A)
  // ------------------------------------------------------------
  static _getAngleOffset(maneuver, direction) {
    const dir = direction === "right" ? 1 : -1;

    switch (maneuver.type) {
      case "drift": return 10 * dir;
      case "bend": return 20 * dir;
      case "swerve": return 30 * dir;
      case "hard-swerve": return 45 * dir;
      case "tight-bend": return 60 * dir;
      default:
        console.warn(`[TurningKey] Unknown maneuver type: ${maneuver.type}`);
        return 0;
    }
  }

  // ------------------------------------------------------------
  // Legality coloring
  // ------------------------------------------------------------
  static _getLegalityColor(token, maneuver) {
    const speed = token.actor.system.speed || 0;
    const hc = token.actor.system.handlingClass || 0;

    const modifier = getControlModifier(speed, hc);

    if (modifier === "safe") return 0x00ff00;
    if (modifier === "XX") return 0xff0000;
    return 0xffff00;
  }
}

window.TemplateRenderer = TemplateRenderer;
