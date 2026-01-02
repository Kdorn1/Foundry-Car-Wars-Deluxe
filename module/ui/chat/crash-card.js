// module/ui/chat/crash-card.js
// Renders a crash result card into chat.

export function renderCrashCard(crash) {
  if (!crash) return;

  const html = `
    <div class="carwars-crash-card">
      <h3>Crash Result</h3>
      <p><strong>Type:</strong> ${crash.type}</p>
      <p><strong>Severity:</strong> ${crash.severity}</p>
      <p><strong>Notes:</strong> ${crash.notes || "—"}</p>
    </div>
  `;

  ChatMessage.create({
    content: html,
    speaker: { alias: "Movement Phase" }
  });
}
