# NEAR Token Sentinel

Zero-cost, local-first monitoring for `batman-4.nearlytrade.near`. The initial
version reads token metadata and total supply from the official public NEAR RPC,
then reads its Nearly launch and Rhea DCL pool configuration. It writes a
timestamped snapshot and can test a Telegram destination explicitly.

No wallet key, seed phrase or NearScanner API key is required.

## Requirements

- Node.js 20 or newer
- A NEP-141 token account ID

## Run locally

```bash
cp .env.example .env
set -a
source .env
set +a
npm test
npm run monitor
```

The snapshot is written to `data/latest.json`, which is intentionally ignored
by Git.

## Telegram test

Create a bot with BotFather, start a conversation with it, and configure
`TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in `.env`. Then run:

```bash
npm run telegram:test
```

This command sends one explicit connectivity message. Automatic alerts remain
disabled until their thresholds and deduplication have been tested locally.

## GitHub Actions

The `Monitor token` workflow is manual during the local validation phase.
Configure these repository variables under **Settings → Secrets and variables
→ Actions → Variables**:

- `MONITORED_TOKEN_ACCOUNT_ID`
- `NEAR_RPC_URL` (optional; the application defaults to the official mainnet RPC)

Run the workflow from the Actions tab. It tests the code, reads the token and
publishes the resulting JSON as a seven-day workflow artifact.

Telegram credentials must later be stored as GitHub **secrets**, never as
variables and never in the repository.

## Planned next steps

1. Validate price snapshots against the Nearly interface over time.
2. Add indexed transfers and holder changes from a separately verified source.
3. Add durable alert state and meaningful change thresholds.
4. Enable Telegram alerts and only then enable the five-minute schedule.

This project provides monitoring data, not investment advice or a safety
guarantee.
