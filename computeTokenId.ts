#!/usr/bin/env node

function computeTokenId(user, slot) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(user)) {
    throw new Error("Invalid Ethereum address");
  }
  if (slot < 0 || slot >= 2 ** 96) {
    throw new Error("Slot must be a 96-bit unsigned integer");
  }

  const slotBigInt = BigInt(slot) << 160n;
  console.log(slotBigInt.toString(16))
  const userBigInt = BigInt(user);
  const tokenId = slotBigInt | userBigInt;

  return `0x${tokenId.toString(16).padStart(64, "0")}`;
}

function runTests() {
  const testCases = [
    {
      user: "0x90abcdef1234567890abcdef1234567890abcdef",
      slot: '0x1234567890abcdef',
      expected:
        "0x000000001234567890abcdef90abcdef1234567890abcdef1234567890abcdef",
    },
    {
      user: "0xffffffffffffffffffffffffffffffffffffffff",
      slot: 0,
      expected:
        "0x000000000000000000000000ffffffffffffffffffffffffffffffffffffffff",
    },
    {
      user: "0x0000000000000000000000000000000000000001",
      slot: 1,
      expected:
        "0x0000000000000000000000010000000000000000000000000000000000000001",
    },
    {
      user: "0x1234567890abcdef1234567890abcdef12345678",
      slot: '0xffffffffffffffffffff',
      expected:
        "0x0000ffffffffffffffffffff1234567890abcdef1234567890abcdef12345678",
    },
  ];

  testCases.forEach(({ user, slot, expected }, index) => {
    try {
      const result = computeTokenId(user, slot);
      if (result === expected) {
        console.log(`Test ${index + 1}: Passed`);
      } else {
        console.error(
          `Test ${index + 1}: Failed\nExpected: ${expected}\nReceived: ${result}`
        );
      }
    } catch (e) {
      console.error(`Test ${index + 1}: Failed with error ${e.message}`);
    }
  });
}

runTests();
