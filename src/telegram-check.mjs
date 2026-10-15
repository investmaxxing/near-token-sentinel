import { loadConfig } from "./config.mjs";
import { sendTelegramMessage } from "./telegram.mjs";

const config = loadConfig();

await sendTelegramMessage(
  config.telegramBotToken,
  config.telegramChatId,
  `NEAR Token Sentinel is connected for ${config.tokenAccountId}.`,
);

console.log("Telegram test message sent successfully");
