// module/movement/lane-change-template.js
// ------------------------------------------------------------
// Car Wars Deluxe Edition — Lane Change Templates
// Shows the diagonal path of a 1" lateral shift.
// ------------------------------------------------------------

import { inchesToPixels, movementThisPhase } from "./movement-engine.js";

export class LaneChangeTemplate {
  /**
   * Create a lane change template.
   * @param {Actor} actor
   * @param {"left"|"right"} direction
   */
  static createFor(actor, direction) {
    if (!actor.token) return;

    const startX = actor.token.x + canvas.grid.size / 2;
    const startY = actor.token.y + canvas.grid.size / 2;
    const facing = actor.token.rotation || 0;

    // Forward distance this phase
    const forwardInches = movementThisPhase(actor);
    const forwardPx = inchesToPixels(forwardInches);

    // Lateral shift (always 1")
    const lateralPx = inchesToPixels(1);
    const lateralSign = direction === "left" ? -1 : 1;

    // Compute end point of the lane change
    const end = LaneChangeTemplate.computeEndPoint(
      startX,
      startY,
      facing,
      forwardPx,
      lateralPx * lateralSign
    );

    // Build template data (ray from start → end)
    const templateData = {
      t: "ray",
      user: game.user.id,
      x: startX,
      y: startY,
      direction: Math.atan2(end.y - startY, end.x - startX) * (180 / Math.PI),
      distance: Math.sqrt((end.x - startX) ** 2 + (end.y - startY) ** 2) / canvas.grid.size,
      width: 0,
      flags: {
        cw: {
          laneChange: true,
          actorId: actor.id,
          direction
        }
      }
    };

    return canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [templateData]);
  }

  /**
   * Remove all lane change templates for this actor.
   */
  static removeFor(actor) {
    const templates = canvas.templates.placeables.filter(t =>
      t.document.getFlag("cw", "laneChange") &&
      t.document.getFlag("cw", "actorId") === actor.id
    );

    const ids = templates.map(t => t.id);
    return canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", ids);
  }

  /**
   * Compute the end point of the lane change.
   */
  static computeEndPoint(x, y, facing, forwardPx, lateralPx) {
    const rad = facing * (Math.PI / 180);

    // Forward vector
    const fx = Math.cos(rad) * forwardPx;
    const fy = Math.sin(rad) * forwardPx;

    // Lateral vector (perpendicular to facing)
    const lx = Math.cos(rad + Math.PI / 2) * lateralPx;
    const ly = Math.sin(rad + Math.PI / 2) * lateralPx;

    return {
      x: x + fx + lx,
      y: y + fy + ly
    };
  }
}
