const fs = require('fs');
const crypto = require('crypto');

const data = [];
const NUM_ENTRIES = 20; // Change this to adjust the number of entries
const HARDCODED_TOKEN_URI = 'ipfs://QmSMxLznvbvHUshnjo1TJyUSkxoLgPs35fjSivgzZ3XWhy';

function generateRandomAddress() {
  const randomBytes = crypto.randomBytes(20); // 20 bytes = 40 hex characters = Ethereum address
  return `0x${randomBytes.toString('hex')}`;
}

// Populate the data array
for (let i = 0; i < NUM_ENTRIES; i += 1) {
  data.push({
    recipient: generateRandomAddress(),
    tokenURI: HARDCODED_TOKEN_URI,
  });
}

const formattedData = data
  .map(entry => `  ${JSON.stringify(entry)}`)
  .join(',\n');

fs.writeFileSync('mint-in-batches.assets.json', `[\n${formattedData}\n]`);

console.log('JSON file written with random recipients and hardcoded tokenURI.');
