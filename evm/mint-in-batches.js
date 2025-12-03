/* eslint-disable no-loop-func */
/*
  This script mints all assets described in the ALL_ASSETS_FILE in batches of BATCH_SIZE.
  Each batch is sent in a separate transaction, as large as possible.

  Transactions are sent with incremental nonces, relying on the network of LAOS nodes
  to handle their sequential ordering and inclusion in the blockchain. The script makes
  sure that there aren't more than MAX_NUM_TXS_WAITING in the nodes' pools,
  to reduce the likelihood of being throttled or blocked by public nodes.

  In a real-world scenario, it is recommended to carefully prepare the ALL_ASSETS_FILE
  with the specific assets you need to mint. This may include unique recipient addresses
  and customized tokenURIs tailored to your requirements.

  The asset attributes can be uploaded to IPFS either before or after the minting process.
  However, uploading them beforehand is the recommended approach.
*/
/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');
const fs = require('fs');

const { PRIVATE_KEY } = process.env;
if (!PRIVATE_KEY) throw new Error('Please set PRIVATE_KEY in your .env file.');

// Write all assets to be minted in a json file:
const ALL_ASSETS_FILE = './assetsForBatchMinting/mint-in-batches.assets.json';

// Recommended max size is currently 700; it will be 2800 (4x) when async backing is integrated.
const BATCH_SIZE = 700;

const MAX_NUM_TXS_WAITING = 15;

// The amount of secs to wait when the pool already has MAX_NUM_TXS_WAITING,
// before trying to send a new batch:
const SECS_TO_WAIT = 12;

// Public RPC nodes:
// - LAOS Mainnet: https://rpc.laos.laosfoundation.io
// - LAOS Sigma Testnet https://rpc.laossigma.laosfoundation.io
const PROVIDER_URL = 'https://rpc.laos.laosfoundation.io';

const sleep = (seconds) => new Promise((resolve) => { setTimeout(resolve, seconds * 1000); });

function randomSlot() {
  return (BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) ** 2n) % BigInt(2n ** 96n - 1n);
}

// Returns an array of random 'slot' params to be used for minting to a recipient
function randomSlotArray(n) {
  const result = new Set();
  while (result.size < n) {
    result.add(randomSlot());
  }
  return Array.from(result);
}

async function deployBatchMinter(wallet) {
  const CONTRACT_ABI_URL = 'https://github.com/freeverseio/laos-smart-contracts/blob/main/batch-minter/artifacts/contracts/LaosBatchMinter.sol/LaosBatchMinter.json?raw=true';
  const response = await axios.get(CONTRACT_ABI_URL);
  const contractData = response.data;

  const contractFactory = new ethers.ContractFactory(
    contractData.abi,
    contractData.bytecode,
    wallet,
  );

  console.log('Deploying BatchMinter with owner = ', wallet.address);
  const instance = await contractFactory.deploy(wallet.address);
  console.log('Transaction sent. Waiting for confirmation...');
  await instance.waitForDeployment();
  console.log('Transaction confirmed.');
  return instance;
}

async function main() {
  const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log('Deployer address:', wallet.address);
  const batchMinter = await deployBatchMinter(wallet);
  console.log('BatchMinter successfully deployed at address:', await batchMinter.getAddress());

  const assets = JSON.parse(fs.readFileSync(ALL_ASSETS_FILE, 'utf8'));

  console.log(`Ready to mint ${assets.length} assets. Please press Enter to continue...`);
  await new Promise(res => process.stdin.once('data', () => res()));

  let currentIndex = 0;
  let nonce = await provider.getTransactionCount(wallet.address);

  // In general, gasLimit is estimated automatically by ethers. In this case, however,
  // gasLimit needs to be manually specified for all TXs, because the script sends simultaneous
  // transactions, each with an incremented nonce, so that they are propagated and included in blocks
  // as soon as possible. Ethers reverts when trying to automatically estimate gas for nonces larger
  // than the current nonce, because there is no way to simulate them.
  const gasLimit = 13000000;

  let nTxsWaiting = 0;
  while (currentIndex < assets.length) {
    const batch = assets.slice(currentIndex, currentIndex + BATCH_SIZE);
    console.log(`Processing batch with nonce ${nonce}, size ${batch.length}, at idx = ${currentIndex}`);

    const recipients = batch.map((asset) => asset.recipient);
    const uris = batch.map((asset) => asset.tokenURI);
    const randoms = randomSlotArray(batch.length);
    const currentNonce = nonce;

    batchMinter.mintWithExternalURIBatch(recipients, randoms, uris, { nonce: currentNonce, gasLimit })
      .then((tx) => {
        console.log(`Transaction with nonce ${currentNonce} sent: ${tx.hash}. Current number of TXs in pool: ${nTxsWaiting}`);
        return tx.wait().then(() => {
          nTxsWaiting -= 1;
          console.log(`Transaction with nonce ${currentNonce} confirmed: ${tx.hash}. Current number of TXs in pool: ${nTxsWaiting}`);
        });
      })
      .catch((error) => {
        console.error(`Error in transaction with nonce ${currentNonce}:`, error);
      });

    nonce += 1;
    nTxsWaiting += 1;
    currentIndex += BATCH_SIZE;

    while (nTxsWaiting >= MAX_NUM_TXS_WAITING) {
      console.log(`Waiting because current number of TXs in pool: ${nTxsWaiting}`);
      await sleep(SECS_TO_WAIT);
    }
  }
  console.log('All batches sent');
}

if (require.main === module) {
  main();
}
