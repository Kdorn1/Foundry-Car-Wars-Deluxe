// module/movement/templates.js
// ------------------------------------------------------------
// Car Wars Deluxe Edition — Turning Key Template Renderer
// RAW-accurate Turning Key Arc Geometry
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

    const radiusPx = inchesToPixels(maneuver.footprint);
    const startX = token.center.x;
    const startY = token.center.y;
    const facing = token.rotation;

    const angleOffset = this._getAngleOffset(maneuver, direction);
    const color = this._getLegalityColor(token, maneuver);

    const preview = this._drawArc(startX, startY, facing, angleOffset, radiusPx, color);

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
  // RAW-accurate Turning Key Arc Rendering
  // ------------------------------------------------------------
  static _drawArc(startX, startY, facing, angleOffset, radiusPx, color) {
    const g = new PIXI.Graphics();
    g.lineStyle(4, color, 0.9);

    const startRad = (facing * Math.PI) / 180;
    const sweepRad = (angleOffset * Math.PI) / 180;

    // Arc center is offset PERPENDICULAR to facing by radius
    const side = sweepRad < 0 ? -1 : 1;
    const centerX = startX + Math.cos(startRad + side * Math.PI / 2) * radiusPx;
    const centerY = startY + Math.sin(startRad + side * Math.PI / 2) * radiusPx;

    // Arc starts at angle pointing from center to token
    const arcStart = Math.atan2(startY - centerY, startX - centerX);
    const arcEnd = arcStart + sweepRad;

    console.log(`[TurningKey] Arc center: (${centerX}, ${centerY})`);
    console.log(`[TurningKey] Arc radius: ${radiusPx}`);

    g.arc(centerX, centerY, radiusPx, arcStart, arcEnd, sweepRad < 0);

    return g;
  }

  // ------------------------------------------------------------
  // Angle offset logic (RAW maneuver angles)
  // ------------------------------------------------------------
  static _getAngleOffset(maneuver, direction) {
    const dir = direction === "right" ? 1 : -1;

    switch (maneuver.type) {
      case "drift": return 15 * dir;
      case "swerve": return 30 * dir;
      case "bend": return 45 * dir;
      case "hard-swerve": return 45 * dir;
      case "tight-bend": return 90 * dir;
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
