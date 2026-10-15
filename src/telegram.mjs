export async function sendTelegramMessage(
  botToken,
  chatId,
  text,
  fetchImpl = fetch,
) {
  if (!botToken || !chatId) {
    throw new Error("Telegram credentials are not configured");
  }

  const response = await fetchImpl(
    `https://api.telegram.org/bot${encodeURIComponent(botToken)}/sendMessage`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(15_000),
    },
  );

  const payload = await response.json();
  if (!response.ok || payload.ok !== true) {
    throw new Error(payload.description || `Telegram returned HTTP ${response.status}`);
  }

  return payload.result;
}
