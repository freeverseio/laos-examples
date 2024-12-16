/*
  This script generates an OUTPUT_FILE containing data for all assets to be minted
  by the script ../mint-in-batches.js. The generated data includes example hardcoded
  tokenURIs and randomly generated recipient addresses.

  In a real-world scenario, it is recommended to carefully prepare the OUTPUT_FILE
  with the specific assets you need to mint. This may include unique recipient addresses
  and customized tokenURIs tailored to your requirements.

  The asset attributes can be uploaded to IPFS either before or after the minting process.
  However, uploading them beforehand is the recommended approach.
*/

const fs = require('fs');
const crypto = require('crypto');

const OUTPUT_FILE = './mint-in-batches.assets.json';
const NUM_ENTRIES = 5000;
const HARDCODED_TOKEN_URI = 'ipfs://QmSMxLznvbvHUshnjo1TJyUSkxoLgPs35fjSivgzZ3XWhy';

function generateRandomAddress() {
  const randomBytes = crypto.randomBytes(20); // 20 bytes = 40 hex characters = Ethereum address
  return `0x${randomBytes.toString('hex')}`;
}

const data = [];
for (let i = 0; i < NUM_ENTRIES; i += 1) {
  data.push({
    recipient: generateRandomAddress(),
    tokenURI: HARDCODED_TOKEN_URI,
  });
}

const formattedData = data
  .map((entry) => `  ${JSON.stringify(entry)}`)
  .join(',\n');

fs.writeFileSync(OUTPUT_FILE, `[\n${formattedData}\n]`);

console.log(`JSON file ${OUTPUT_FILE} written with random recipients and hardcoded tokenURI.`);
