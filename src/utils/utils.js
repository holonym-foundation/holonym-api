import { strict as assert } from "node:assert";

export function logWithTimestamp(message) {
  console.log(`${new Date().toISOString()} ${message}`);
}

export function assertValidAddress(address) {
  try {
    assert.ok(typeof address == "string");
    assert.equal(address.length, 42);
    assert.ok(address.startsWith("0x"));
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}
