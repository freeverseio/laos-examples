/*
  Creates a collection on the LAOS Network. Once created, the collection's address
  can be used to deploy an ERC721 contract on any EVM chain, which links to the
  LAOS collection as its sibling.

  Refer to the `setup-bridgeless-minting` script for an example of how to set up
  both contracts.
*/
/* eslint-disable no-underscore-dangle */
require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');

const { PRIVATE_KEY } = process.env;
if (!PRIVATE_KEY) throw new Error('Please set PRIVATE_KEY in your .env file.');

// Public RPC nodes:
// - LAOS Mainnet: https://rpc.laos.laosfoundation.io
// - LAOS Sigma Testnet https://rpc.laossigma.laosfoundation.io
const PROVIDER_URL = 'https://rpc.laossigma.laosfoundation.io';

/**
 * Creates a new collection on the LAOS network.
 * @param {ethers.Wallet} wallet - The ethers.js wallet instance.
 * @returns {Promise<string>} - The address of the created collection.
 */
async function createLAOSCollection(wallet) {
  try {
    const CONTRACT_ABI_URL = 'https://github.com/freeverseio/laos/blob/main/pallets/laos-evolution/src/precompiles/evolution_collection_factory/contracts/EvolutionCollectionFactory.json?raw=true';
    const response = await axios.get(CONTRACT_ABI_URL);
    const contractABI = response.data;

    const COLLECTION_FACTORY_ADDR = '0x0000000000000000000000000000000000000403';
    const contract = new ethers.Contract(COLLECTION_FACTORY_ADDR, contractABI, wallet);

    console.log('Creating sibling collection on LAOS...');
    const tx = await contract.createCollection(wallet.address);

    console.log('Transaction sent. Waiting for confirmation...');
    const receipt = await tx.wait();

    console.log('Transaction confirmed. Collection created in block number:', receipt.blockNumber);

    const event = receipt.logs.find(
      (log) => log.address.toLowerCase() === COLLECTION_FACTORY_ADDR.toLowerCase(),
    );
    if (event) {
      const iface = new ethers.Interface(contractABI);
      const decodedEvent = iface.decodeEventLog('NewCollection', event.data, event.topics);
      return decodedEvent._collectionAddress;
    }

    throw new Error('New collection event log not found.');
  } catch (error) {
    console.error('Error in createLAOSCollection:', error.message || error);
    throw error;
  }
}

async function main() {
  const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log('Deployer address:', wallet.address);
  const collectionAddress = await createLAOSCollection(wallet);
  console.log('LAOS sibling collection successfully created at address:', collectionAddress);
}

module.exports = { createLAOSCollection };

if (require.main === module) {
  main();
}
