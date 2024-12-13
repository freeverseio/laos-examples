/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');
const fs = require('fs');

const { PRIVATE_KEY } = process.env;
if (!PRIVATE_KEY) throw new Error('Please set PRIVATE_KEY in your .env file.');

const BATCH_SIZE = 12;
const SECONDS_BETWEEN_SUBMISSIONS = 4;

// Public RPC nodes:
// - LAOS Mainnet: https://rpc.laos.laosfoundation.io
// - LAOS Sigma Testnet https://rpc.laossigma.laosfoundation.io
const PROVIDER_URL = 'https://rpc.laos.laosfoundation.io';

const sleep = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

function randomSlot() {
  return (BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) ** 2n) % BigInt(2n ** 96n - 1n);
}

function randomSlotArray(n) {
  const result = new Set();
  while (result.size < n) {
    result.add(randomSlot()); // Call the function to get its return value
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

  const assets = JSON.parse(fs.readFileSync('mint-in-batches.assets.json', 'utf8'));

  let currentIndex = 0;
  let nonce = await provider.getTransactionCount(wallet.address);
  const gasLimit = 2000000;

  while (currentIndex < assets.length) {
    const batch = assets.slice(currentIndex, currentIndex + BATCH_SIZE);
    console.log(`Processing batch with nonce ${nonce}, size ${batch.length}, at idx = ${currentIndex}`);

    const recipients = batch.map((asset) => asset.recipient);
    const uris = batch.map((asset) => asset.tokenURI);
    const randoms = randomSlotArray(batch.length);

    const currentNonce = nonce;
    const txPromise = batchMinter.mintWithExternalURIBatch(recipients, randoms, uris, { nonce: currentNonce, gasLimit })
      .then((tx) => {
        console.log(`Transaction with nonce ${currentNonce} sent: ${tx.hash}`);
        return tx.wait().then(() => {
          console.log(`Transaction with nonce ${currentNonce} confirmed: ${tx.hash}`);
        });
      })
      .catch((error) => {
        console.error(`Error in transaction with nonce ${currentNonce}:`, error);
      });
    txPromise.catch((error) => console.error(`Error handling transaction for nonce ${currentNonce}:`, error));

    nonce += 1;
    currentIndex += BATCH_SIZE;

    await sleep(SECONDS_BETWEEN_SUBMISSIONS);
  }
  console.log('All batches sent');
}

if (require.main === module) {
  main();
}
