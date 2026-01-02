// module/movement/turn-arc-template.js
// ------------------------------------------------------------
// Car Wars Deluxe Edition — Turn Arc Templates
// Draws curved maneuver paths (bends, turns, bootleggers).
// ------------------------------------------------------------

import { inchesToPixels } from "./movement-engine.js";

export class TurnArcTemplate {
  /**
   * Create a turn arc template for a maneuver.
   * @param {Actor} actor
   * @param {Object} maneuver - from ManeuverRegistry
   */
  static createFor(actor, maneuver) {
    if (!actor.token) return;

    const startX = actor.token.x + canvas.grid.size / 2;
    const startY = actor.token.y + canvas.grid.size / 2;
    const facing = actor.token.rotation || 0;

    // Lookup radius and angle for this maneuver
    const { radius, angle } = TurnArcTemplate.lookupGeometry(maneuver);

    const radiusPx = inchesToPixels(radius);

    // Compute center of the turn arc
    const center = TurnArcTemplate.computeTurnCenter(
      startX,
      startY,
      facing,
      radiusPx,
      maneuver.direction
    );

    // Build template data
    const templateData = {
      t: "cone", // Foundry uses cone for arcs
      user: game.user.id,
      x: center.x,
      y: center.y,
      distance: radius,
      angle: angle,
      direction: facing + (maneuver.direction === "left" ? -90 : 90),
      flags: {
        cw: {
          turnArc: true,
          actorId: actor.id,
          maneuverId: maneuver.id
        }
      }
    };

    return canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [templateData]);
  }

  /**
   * Remove all turn arc templates for this actor.
   */
  static removeFor(actor) {
    const templates = canvas.templates.placeables.filter(t =>
      t.document.getFlag("cw", "turnArc") &&
      t.document.getFlag("cw", "actorId") === actor.id
    );

    const ids = templates.map(t => t.id);
    return canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", ids);
  }

  /**
   * Lookup radius + angle for a maneuver.
   * Car Wars Deluxe standard geometry.
   */
  static lookupGeometry(maneuver) {
    const table = {
      "d1-bend": { radius: 3, angle: 15 },
      "d2-bend": { radius: 4, angle: 30 },
      "d3-bend": { radius: 5, angle: 45 },
      "turn-45": { radius: 5, angle: 45 },
      "turn-90": { radius: 5, angle: 90 },
      "bootlegger": { radius: 5, angle: 180 }
    };

    return table[maneuver.id] || { radius: 5, angle: 45 };
  }

  /**
   * Compute the center point of the turn arc.
   * This is perpendicular to the vehicle's facing.
   */
  static computeTurnCenter(x, y, facing, radiusPx, direction) {
    const angleRad =
      (facing + (direction === "left" ? -90 : 90)) * (Math.PI / 180);

    return {
      x: x + Math.cos(angleRad) * radiusPx,
      y: y + Math.sin(angleRad) * radiusPx
    };
  }
}
