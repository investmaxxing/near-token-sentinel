import assert from "node:assert/strict";
import test from "node:test";
import { loadConfig } from "../src/config.mjs";

test("loads public monitoring configuration without any API key", () => {
  const config = loadConfig({ MONITORED_TOKEN_ACCOUNT_ID: "token.near" });

  assert.equal(config.tokenAccountId, "token.near");
  assert.equal(config.nearRpcUrl, "https://rpc.mainnet.near.org");
  assert.equal(config.telegramBotToken, null);
});

test("rejects an invalid token account", () => {
  assert.throws(
    () => loadConfig({ MONITORED_TOKEN_ACCOUNT_ID: "INVALID TOKEN" }),
    /valid NEAR account ID/,
  );
});

test("requires both Telegram values when Telegram is configured", () => {
  assert.throws(
    () =>
      loadConfig({
        MONITORED_TOKEN_ACCOUNT_ID: "token.near",
        TELEGRAM_BOT_TOKEN: "secret",
      }),
    /must either both be set/,
  );
});
