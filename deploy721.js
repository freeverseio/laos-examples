/* eslint-disable max-len */
require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');

const { PRIVATE_KEY } = process.env;
if (!PRIVATE_KEY) {
  throw new Error('Please set PRIVATE_KEY in your .env file.');
}

// Choose an RPC provider for the EVM chain you want to deploy the uERC721:
const PROVIDER_URL = 'https://polygon-bor-rpc.publicnode.com';

// Specify the previously created sibling collection on LAOS:
const LAOS_SIBLING_COLLECTION = {
  isLAOSMainnet: false,
  address: '0xfffFfFffffFffFfFFfFFffFE0000000000000196',
};

// Other less relevant choices:
const ERC721Name = 'Bridgeless Minting ERC721';
const ERC721Symbol = 'CoolLaos';

function buildBaseURI(laosSiblingCollection) {
  const baseULOC = laosSiblingCollection.isLAOSMainnet
    ? 'https://uloc.io/GlobalConsensus(2)/Parachain(3370)/PalletInstance(51)'
    : 'GlobalConsensus(0:0x77afd6190f1554ad45fd0d31aee62aacc33c6db0ea801129acb813f913e0764f)/Parachain(4006)/PalletInstance(51)';
  return `${baseULOC}/AccountKey20(${laosSiblingCollection.address})/`;
}

function displayInfo(laosSiblingCollection) {
  const text = laosSiblingCollection.isLAOSMainnet ? 'Mainnet' : 'Sigma Testnet';
  console.log(`Deploying ERC721 contract linked to sibling LAOS ${text} collection at ${laosSiblingCollection.address}`);
}

/**
 * Deploys a new uERC721 contract on the specified EVM chain using the provided RPC node.
 * @param {Object} laosSiblingCollection - An object containing information about the sibling collection on LAOS.
 * @param {string} laosSiblingCollection.address - The sibling collection address on LAOS.
 * @param {boolean} laosSiblingCollection.isLAOSMainnet - Indicates whether the sibling collection is on LAOS Mainnet (true) or Sigma Testnet (false).
 * @param {ethers.Wallet} wallet - An ethers.js wallet instance connected to the desired provider.
 * @returns {Promise<string>} - The address of the deployed uERC721 contract.
 */
async function deploy721(laosSiblingCollection, wallet) {
  const CONTRACT_ABI_URL = 'https://github.com/freeverseio/laos-erc721/blob/main/artifacts/contracts/ERC721Universal.sol/ERC721Universal.json?raw=true';
  const response = await axios.get(CONTRACT_ABI_URL);
  const contractData = response.data;

  const contractFactory = new ethers.ContractFactory(
    contractData.abi,
    contractData.bytecode,
    wallet,
  );

  displayInfo(laosSiblingCollection);
  const baseURI = buildBaseURI(laosSiblingCollection);
  const instance = await contractFactory.deploy(wallet.address, ERC721Name, ERC721Symbol, baseURI);
  console.log('Transaction sent. Waiting for confirmation...');
  await instance.waitForDeployment();
  console.log('Transaction confirmed.');
  return instance.getAddress();
}

async function main() {
  const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log('Deployer address:', wallet.address);
  const collectionAddress = await deploy721(LAOS_SIBLING_COLLECTION, wallet);
  console.log('ERC721 successfully deployed at address:', collectionAddress);
}

if (require.main === module) {
  main();
}
