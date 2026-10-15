import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { loadConfig } from "./config.mjs";
import { readNearlyLaunch } from "./nearly.mjs";
import { formatTokenAmount, viewFunction } from "./near-rpc.mjs";

const config = loadConfig();

const [metadataResult, supplyResult] = await Promise.all([
  viewFunction(config.nearRpcUrl, config.tokenAccountId, "ft_metadata"),
  viewFunction(config.nearRpcUrl, config.tokenAccountId, "ft_total_supply"),
]);

const metadata = metadataResult.value;
const rawTotalSupply = supplyResult.value;
const nearlyLaunch = config.tokenAccountId.endsWith(".nearlytrade.near")
  ? await readNearlyLaunch(config.nearRpcUrl, config.tokenAccountId)
  : null;
const snapshot = {
  schemaVersion: 1,
  capturedAt: new Date().toISOString(),
  network: "mainnet",
  tokenAccountId: config.tokenAccountId,
  block: {
    height: Math.min(metadataResult.blockHeight, supplyResult.blockHeight),
  },
  token: {
    name: metadata.name,
    symbol: metadata.symbol,
    decimals: metadata.decimals,
    icon: metadata.icon?.startsWith("data:") ? null : (metadata.icon ?? null),
    hasEmbeddedIcon: Boolean(metadata.icon?.startsWith("data:")),
    reference: metadata.reference ?? null,
    rawTotalSupply,
    totalSupply: formatTokenAmount(rawTotalSupply, metadata.decimals),
  },
  nearly: nearlyLaunch,
};

await mkdir(dirname(config.outputPath), { recursive: true });
await writeFile(config.outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

console.log(
  `Captured ${snapshot.token.symbol} at block ${snapshot.block.height}; snapshot written to ${config.outputPath}`,
);
