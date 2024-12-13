/* eslint-disable no-await-in-loop */
/* eslint-disable max-len */
require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');
const fs = require('fs');

const { PRIVATE_KEY } = process.env;
if (!PRIVATE_KEY) throw new Error('Please set PRIVATE_KEY in your .env file.');

const BATCH_SIZE = 2;
const SECONDS_BETWEEN_SUBMISSIONS = 4;

// Public RPC nodes:
// - LAOS Mainnet: https://rpc.laos.laosfoundation.io
// - LAOS Sigma Testnet https://rpc.laossigma.laosfoundation.io
const PROVIDER_URL = 'https://rpc.laossigma.laosfoundation.io';

const sleep = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

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
  return instance.getAddress();
}

async function main() {
  // const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
  // const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  // console.log('Deployer address:', wallet.address);
  // const collectionAddress = await deployBatchMinter(wallet);
  // console.log('BatchMinter successfully deployed at address:', collectionAddress);

  const assets = JSON.parse(fs.readFileSync('mint-in-batches.assets.json', 'utf8'));
  console.log(assets);

  let currentIndex = 0;

  while (currentIndex < assets.length) {
    const batch = assets.slice(currentIndex, currentIndex + BATCH_SIZE);
    const nAssetsInBatch = batch.length;
    console.log(`Processing batch of ${nAssetsInBatch} assets starting at idx = ${currentIndex}`);

    currentIndex += BATCH_SIZE;
    await sleep(SECONDS_BETWEEN_SUBMISSIONS);
  }

  console.log('All batches processed.');
}

if (require.main === module) {
  main();
}
