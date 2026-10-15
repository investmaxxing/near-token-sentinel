import assert from "node:assert/strict";
import test from "node:test";
import { formatTokenAmount, viewFunction } from "../src/near-rpc.mjs";

test("formats token amounts without losing integer precision", () => {
  assert.equal(formatTokenAmount("1000000000000000000", 18), "1");
  assert.equal(formatTokenAmount("123456789012345678901", 18), "123.456789012345678901");
  assert.equal(formatTokenAmount("0", 18), "0");
});

test("builds and decodes a NEAR view-function request", async () => {
  const fetchMock = async (_url, options) => {
    const request = JSON.parse(options.body);
    assert.equal(request.params.account_id, "token.near");
    assert.equal(request.params.method_name, "ft_metadata");

    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        result: {
          block_height: 123,
          block_hash: "hash",
          result: [...Buffer.from(JSON.stringify({ symbol: "TEST" }))],
        },
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  };

  const result = await viewFunction(
    "https://rpc.example.test",
    "token.near",
    "ft_metadata",
    {},
    fetchMock,
  );

  assert.equal(result.value.symbol, "TEST");
  assert.equal(result.blockHeight, 123);
});
