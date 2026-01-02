// module/ui/chat/control-roll-card.js
// Renders a control roll prompt card into chat.

export function renderControlRollCard(control) {
  if (!control || !control.required) return;

  const html = `
    <div class="carwars-control-roll-card">
      <h3>Control Roll Required</h3>
      <p><strong>Target:</strong> ${control.target}</p>
      <p><strong>Reason:</strong> ${control.reason}</p>
      <button class="carwars-control-roll-btn" data-target="${control.target}">
        Roll Control
      </button>
    </div>
  `;

  ChatMessage.create({
    content: html,
    speaker: { alias: "Movement Phase" }
  });
}
