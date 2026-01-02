// module/movement/spinout-template.js
// ------------------------------------------------------------
// Car Wars Deluxe Edition — Spinout Template
// Shows a simple circular marker where the vehicle spun out.
// ------------------------------------------------------------

export class SpinoutTemplate {
  static createFor(actor) {
    if (!actor.token) return;

    const x = actor.token.x + canvas.grid.size / 2;
    const y = actor.token.y + canvas.grid.size / 2;

    const templateData = {
      t: "circle",
      user: game.user.id,
      x,
      y,
      distance: 1, // 1" radius marker
      flags: {
        cw: {
          spinout: true,
          actorId: actor.id
        }
      }
    };

    return canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [templateData]);
  }

  static removeFor(actor) {
    const templates = canvas.templates.placeables.filter(t =>
      t.document.getFlag("cw", "spinout") &&
      t.document.getFlag("cw", "actorId") === actor.id
    );

    if (!templates.length) return;
    const ids = templates.map(t => t.id);
    return canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", ids);
  }
}
