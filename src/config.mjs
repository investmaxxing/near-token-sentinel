const NEAR_ACCOUNT_ID = /^(?=.{2,64}$)[a-z0-9]+(?:[._-][a-z0-9]+)*$/;

export function loadConfig(env = process.env) {
  const tokenAccountId = env.MONITORED_TOKEN_ACCOUNT_ID?.trim();

  if (!tokenAccountId) {
    throw new Error("MONITORED_TOKEN_ACCOUNT_ID is required");
  }

  if (!NEAR_ACCOUNT_ID.test(tokenAccountId)) {
    throw new Error("MONITORED_TOKEN_ACCOUNT_ID is not a valid NEAR account ID");
  }

  const nearRpcUrl = env.NEAR_RPC_URL?.trim() || "https://rpc.mainnet.near.org";
  const outputPath = env.OUTPUT_PATH?.trim() || "data/latest.json";
  const telegramBotToken = env.TELEGRAM_BOT_TOKEN?.trim() || null;
  const telegramChatId = env.TELEGRAM_CHAT_ID?.trim() || null;

  if (Boolean(telegramBotToken) !== Boolean(telegramChatId)) {
    throw new Error(
      "TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must either both be set or both be empty",
    );
  }

  return {
    tokenAccountId,
    nearRpcUrl,
    outputPath,
    telegramBotToken,
    telegramChatId,
  };
}
