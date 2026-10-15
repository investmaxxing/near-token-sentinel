function decodeViewResult(bytes) {
  const json = Buffer.from(bytes).toString("utf8");
  return JSON.parse(json);
}

export async function viewFunction(
  rpcUrl,
  accountId,
  methodName,
  args = {},
  fetchImpl = fetch,
) {
  const response = await fetchImpl(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: `${accountId}:${methodName}`,
      method: "query",
      params: {
        request_type: "call_function",
        finality: "final",
        account_id: accountId,
        method_name: methodName,
        args_base64: Buffer.from(JSON.stringify(args)).toString("base64"),
      },
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new Error(`NEAR RPC returned HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (payload.error) {
    const message = payload.error.data ?? payload.error.message ?? "Unknown RPC error";
    throw new Error(`NEAR RPC error: ${String(message)}`);
  }

  return {
    value: decodeViewResult(payload.result.result),
    blockHeight: payload.result.block_height,
    blockHash: payload.result.block_hash,
  };
}

export function formatTokenAmount(rawAmount, decimals) {
  if (!/^\d+$/.test(rawAmount)) {
    throw new Error("Token amount must be an unsigned integer string");
  }
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 255) {
    throw new Error("Token decimals are invalid");
  }

  const padded = rawAmount.padStart(decimals + 1, "0");
  const integer = decimals === 0 ? padded : padded.slice(0, -decimals);
  const fraction = decimals === 0 ? "" : padded.slice(-decimals).replace(/0+$/, "");
  return fraction ? `${integer}.${fraction}` : integer;
}
