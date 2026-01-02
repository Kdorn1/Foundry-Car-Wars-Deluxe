// module/movement/skid-template.js
// ------------------------------------------------------------
// Car Wars Deluxe Edition — Skid Templates
// Visualizes uncontrolled drift during skids and fishtails.
// ------------------------------------------------------------

import { inchesToPixels } from "./movement-engine.js";

export class SkidTemplate {
  /**
   * Create a skid template.
   * @param {Actor} actor
   * @param {Object} skidData - { distanceInches, directionDegrees }
   */
  static createFor(actor, skidData) {
    if (!actor.token) return;

    const startX = actor.token.x + canvas.grid.size / 2;
    const startY = actor.token.y + canvas.grid.size / 2;

    const distancePx = inchesToPixels(skidData.distanceInches);

    // Compute end point of the skid
    const rad = skidData.directionDegrees * (Math.PI / 180);
    const endX = startX + Math.cos(rad) * distancePx;
    const endY = startY + Math.sin(rad) * distancePx;

    // Build template data (ray from start → end)
    const templateData = {
      t: "ray",
      user: game.user.id,
      x: startX,
      y: startY,
      direction: skidData.directionDegrees,
      distance: skidData.distanceInches,
      width: 0,
      flags: {
        cw: {
          skid: true,
          actorId: actor.id
        }
      }
    };

    return canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [templateData]);
  }

  /**
   * Remove all skid templates for this actor.
   */
  static removeFor(actor) {
    const templates = canvas.templates.placeables.filter(t =>
      t.document.getFlag("cw", "skid") &&
      t.document.getFlag("cw", "actorId") === actor.id
    );

    const ids = templates.map(t => t.id);
    return canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", ids);
  }
}
