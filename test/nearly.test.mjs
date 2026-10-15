import assert from "node:assert/strict";
import test from "node:test";
import { calculateDclPrice } from "../src/nearly.mjs";

test("calculates DCL quote price in both token orientations", () => {
  assert.equal(calculateDclPrice(0, 24, true), 0.000001);
  assert.equal(calculateDclPrice(0, 24, false), 0.000001);
  assert.ok(calculateDclPrice(100, 24, true) > 0.000001);
  assert.ok(calculateDclPrice(100, 24, false) < 0.000001);
});
