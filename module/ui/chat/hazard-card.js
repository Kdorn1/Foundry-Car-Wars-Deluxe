// module/ui/chat/hazard-card.js
// Renders a simple hazard summary card into chat.

export function renderHazardCard(hazards) {
  if (!hazards || hazards.length === 0) return;

  const list = hazards
    .map(h => `<li><strong>${h.type}</strong>: HC ${h.hcChange > 0 ? "+" : ""}${h.hcChange}</li>`)
    .join("");

  const html = `
    <div class="carwars-hazard-card">
      <h3>Hazards</h3>
      <ul>${list}</ul>
    </div>
  `;

  ChatMessage.create({
    content: html,
    speaker: { alias: "Movement Phase" }
  });
}
