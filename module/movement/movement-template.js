// module/movement/movement-template.js

import { inchesToPixels, movementThisPhase } from "./movement-engine.js";

export class MovementTemplate {
  static createFor(actor) {
    const distance = movementThisPhase(actor);
    const pixels = inchesToPixels(distance);

    const templateData = {
      t: "ray",
      user: game.user.id,
      distance,
      direction: actor.token?.rotation || 0,
      x: actor.token?.x + (canvas.grid.size / 2),
      y: actor.token?.y + (canvas.grid.size / 2),
      width: pixels,
      flags: {
        cw: {
          movement: true,
          actorId: actor.id
        }
      }
    };

    return canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [templateData]);
  }

  static removeFor(actor) {
    const templates = canvas.templates.placeables.filter(t =>
      t.document.getFlag("cw", "movement") &&
      t.document.getFlag("cw", "actorId") === actor.id
    );

    const ids = templates.map(t => t.id);
    return canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", ids);
  }
}

/* -------------------------------------------------------------------------
   ADDITIONAL RECOMMENDED IMPROVEMENTS (APPENDED ONLY — NO CHANGES ABOVE)
   ------------------------------------------------------------------------- */

/**
 * Optional: Ensure we don't attempt to create templates for actors
 * without tokens on the canvas.
 */
export function hasValidToken(actor) {
  return !!actor.token;
}

/**
 * Optional styling block for future customization.
 * These values are NOT applied automatically yet — they are here
 * for future expansion when you want to style movement templates.
 */
export const MovementTemplateStyle = {
  borderColor: "#00ff00",
  fillColor: "#00ff00",
  fillAlpha: 0.15,
  lineWidth: 4,
  dash: [10, 5]
};

/**
 * Optional: Placeholder for rotation offset logic.
 * Car Wars vehicles have a "front" that may not align perfectly
 * with Foundry's template rotation origin.
 */
export function computeRotationOffset(actor) {
  // Future logic could adjust template origin slightly forward.
  return 0; // no offset yet
}

/**
 * Future expansion: Skid template support.
 * This is a placeholder for when you implement skidding visuals.
 */
export class SkidTemplate {
  static createFor(actor) {
    // Placeholder for future skid arc or drift visualization.
    console.log("SkidTemplate.createFor() called — not implemented yet.");
  }
}

/**
 * Future expansion: Turn arc templates (D1, D2, D3 turns).
 */
export class TurnArcTemplate {
  static createFor(actor, maneuver) {
    // Placeholder for future turn arc visualization.
    console.log("TurnArcTemplate.createFor() called — not implemented yet.");
  }
}
