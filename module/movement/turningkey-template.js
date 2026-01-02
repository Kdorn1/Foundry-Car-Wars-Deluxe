// module/movement/turningkey-template.js
// ------------------------------------------------------------
// Interactive Turning Key Template Placement (Portable-safe)
// ------------------------------------------------------------

import { MANEUVERS } from "./maneuver-registry.js";
import { inchesToPixels } from "./movement-engine.js";
import { TemplateRenderer } from "./templates.js";
import { TurningKeyMeasuredTemplate } from "./turningkey-measuredtemplate.js";

export class TurningKeyTemplate {

  /**
   * Begin interactive placement of a Turning Key template.
   * Portable-safe: uses a universal preview method compatible with v10–v13.
   */
  static async placeInteractive(token, maneuverId, direction = "left") {
    if (!token) {
      ui.notifications.warn("Select a vehicle token first.");
      return;
    }

    const maneuver = MANEUVERS[maneuverId];
    if (!maneuver) {
      ui.notifications.error(`Unknown maneuver: ${maneuverId}`);
      return;
    }

    // Compute geometry
    const forwardPx = inchesToPixels(maneuver.footprint);
    const angleOffset = TemplateRenderer._getAngleOffset(maneuver, direction);

    // Build template data using a built-in v13 type (ray)
    const templateData = {
      t: "ray",
      user: game.user.id,
      x: token.center.x,
      y: token.center.y,
      distance: forwardPx,
      direction: token.rotation + angleOffset,
      flags: {
        "carwars-system": {
          maneuverId,
          direction,
          tokenId: token.id
        }
      }
    };

    // Create the document
    const doc = new MeasuredTemplateDocument(templateData, { parent: canvas.scene });

    // ------------------------------------------------------------
    // UNIVERSAL PREVIEW METHOD (works in v10–v13 Portable)
    // ------------------------------------------------------------
    // Instantiate our custom renderer and add it to the template layer.
    // This approach avoids relying on version-specific preview helpers.
    const preview = new TurningKeyMeasuredTemplate(doc);

    // Add to the template layer so it is visible on the canvas
    canvas.templates.addChild(preview);

    // Draw the preview (our class overrides draw())
    await preview.draw();

    // Enable drag-to-place interaction (universal method)
    if (typeof preview.activatePreviewListeners === "function") {
      preview.activatePreviewListeners();
    } else if (typeof preview.activateListeners === "function") {
      // Fallback for environments exposing a different API name
      preview.activateListeners();
    } else {
      // As a last resort, log a warning so developers can inspect
      console.warn("[TurningKey] Preview listeners could not be activated; interactive placement may not work in this environment.");
    }
  }
}

// Make available in console for debugging
globalThis.TurningKeyTemplate = TurningKeyTemplate;
