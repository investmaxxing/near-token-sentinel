import { formatTokenAmount, viewFunction } from "./near-rpc.mjs";

export function calculateDclPrice(currentPoint, quoteDecimals, tokenIsX) {
  if (!Number.isInteger(currentPoint)) {
    throw new Error("Rhea current point is invalid");
  }
  if (!Number.isInteger(quoteDecimals) || quoteDecimals < 0) {
    throw new Error("Quote token decimals are invalid");
  }

  const point = tokenIsX ? currentPoint : -currentPoint;
  return 1.0001 ** point * 10 ** (18 - quoteDecimals);
}

export async function readNearlyLaunch(rpcUrl, tokenAccountId, fetchImpl = fetch) {
  const launchResult = await viewFunction(
    rpcUrl,
    "nearlytrade.near",
    "get_launch_by_token",
    { token: tokenAccountId },
    fetchImpl,
  );

  if (!launchResult.value) return null;

  const launch = launchResult.value;
  const [poolResult, quoteMetadataResult] = await Promise.all([
    viewFunction(
      rpcUrl,
      "dclv2.ref-labs.near",
      "get_pool",
      { pool_id: launch.pool_id },
      fetchImpl,
    ),
    viewFunction(rpcUrl, launch.quote, "ft_metadata", {}, fetchImpl),
  ]);

  const pool = poolResult.value;
  const quoteMetadata = quoteMetadataResult.value;
  const priceInQuote = calculateDclPrice(
    pool.current_point,
    quoteMetadata.decimals,
    launch.token_is_x,
  );
  const genesisSupply = Number(formatTokenAmount(launch.total_supply, 18));

  return {
    launchId: launch.id,
    creatorAccountId: launch.creator,
    createdAt: new Date(launch.created_at_ms).toISOString(),
    state: launch.step,
    poolId: launch.pool_id,
    poolState: pool.state,
    currentPoint: pool.current_point,
    quoteAccountId: launch.quote,
    quoteSymbol: quoteMetadata.symbol,
    tokenIsX: launch.token_is_x,
    priceInQuote: priceInQuote.toPrecision(15),
    genesisMarketCapInQuote: (priceInQuote * genesisSupply).toPrecision(15),
  };
}
