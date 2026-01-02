// module/movement/bootlegger-template.js
// ------------------------------------------------------------
// Car Wars Deluxe Edition — Bootlegger Reverse Templates
// Draws the 180° arc used for bootlegger reverses.
// ------------------------------------------------------------

import { inchesToPixels } from "./movement-engine.js";

export class BootleggerTemplate {
  /**
   * Create a bootlegger reverse template.
   * @param {Actor} actor
   * @param {Object} maneuver - maneuver definition from ManeuverRegistry
   *   Expected fields:
   *   - direction: "left" or "right"
   */
  static createFor(actor, maneuver) {
    if (!actor.token) return;

    const startX = actor.token.x + canvas.grid.size / 2;
    const startY = actor.token.y + canvas.grid.size / 2;
    const facing = actor.token.rotation || 0;

    // Bootlegger geometry: 180° arc, 5" radius
    const radiusInches = 5;
    const angle = 180;
    const radiusPx = inchesToPixels(radiusInches);

    // Compute center point of the arc: offset 90° left/right from facing
    const center = BootleggerTemplate._computeTurnCenter(
      startX,
      startY,
      facing,
      radiusPx,
      maneuver.direction
    );

    const templateData = {
      t: "cone",
      user: game.user.id,
      x: center.x,
      y: center.y,
      distance: radiusInches,
      angle,
      // Direction points along the arc; orient so the flat edge faces the car
      direction: facing + (maneuver.direction === "left" ? -90 : 90),
      flags: {
        cw: {
          bootlegger: true,
          actorId: actor.id,
          maneuverId: maneuver.id
        }
      }
    };

    return canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [templateData]);
  }

  /**
   * Remove all bootlegger templates for this actor.
   */
  static removeFor(actor) {
    const templates = canvas.templates.placeables.filter(t =>
      t.document.getFlag("cw", "bootlegger") &&
      t.document.getFlag("cw", "actorId") === actor.id
    );

    if (!templates.length) return;
    const ids = templates.map(t => t.id);
    return canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", ids);
  }

  /**
   * Compute the center point of the bootlegger arc.
   */
  static _computeTurnCenter(x, y, facing, radiusPx, direction) {
    const offsetAngle =
      facing + (direction === "left" ? -90 : 90);
    const angleRad = offsetAngle * (Math.PI / 180);

    return {
      x: x + Math.cos(angleRad) * radiusPx,
      y: y + Math.sin(angleRad) * radiusPx
    };
  }
}
