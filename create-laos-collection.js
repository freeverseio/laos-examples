/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-underscore-dangle */
require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');

// Environment variables
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error('Please set PRIVATE_KEY in your .env file.');
}

// The precompiled contract address exposing collection creation at protocol level:
const contractAddress = '0x0000000000000000000000000000000000000403';

// The URL of the interface ABI, from GitHub
const contractABIUrl = 'https://github.com/freeverseio/laos/blob/main/pallets/laos-evolution/src/precompiles/evolution_collection_factory/contracts/EvolutionCollectionFactory.json?raw=true';

async function main() {
  try {
    // Fetching the contract ABI
    const response = await axios.get(contractABIUrl);
    const contractABI = response.data;

    // Initialize Ethers provider and wallet
    const provider = new ethers.JsonRpcProvider('https://rpc.laossigma.laosfoundation.io');
    const wallet = new ethers.Wallet(privateKey, provider);

    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

    console.log('Creating collection...');
    const tx = await contract.createCollection(wallet.address);

    console.log('Transaction sent. Waiting for confirmation...');
    const receipt = await tx.wait();

    console.log('Transaction confirmed. Collection created in block number:', receipt.blockNumber);

    // Retrieve the contract address from the emitted event, via transaction receipt
    const event = receipt.logs.find(
      (log) => log.address.toLowerCase() === contractAddress.toLowerCase(),
    );
    if (event) {
      const iface = new ethers.Interface(contractABI);
      const decodedEvent = iface.decodeEventLog('NewCollection', event.data, event.topics);
      console.log(`Contract address: ${decodedEvent._collectionAddress}`);
    } else {
      console.log('New collection event log not found.');
    }
  } catch (error) {
    console.error('Error:', error.message || error);
  }
}

main();
