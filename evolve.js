/* eslint-disable import/no-extraneous-dependencies */
/*
  Updates the metadata of an asset.
  The sender must be the owner of the collection in LAOS.
*/
/* eslint-disable no-underscore-dangle */
require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');

// Environment variables
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error('Please set PRIVATE_KEY in your .env file.');
}

// The contract address of a collection in LAOS owned by the sender
const laosCollectionAddr = '0xFfFfFffFFffFFfFfFffFfFFe0000000000000192';

// The IPFS address with the updated metadata of the asset
const tokenURI = 'ipfs://QmPuwGA4tHHdog5R4w1TUGjVGf2zd1v6fXJZhiXgJ8a1Tj';

// The tokenID of the token to be updated. Check mint.js to create one if needed.
const tokenID = '4001281723811432816234343810199020636067393850310169467035147443629304806634';

// The URL of the interface ABI, from GitHub
const contractABIUrl = 'https://github.com/freeverseio/laos/blob/main/pallets/laos-evolution/src/precompiles/evolution_collection/contracts/EvolutionCollection.json?raw=true';

async function main() {
  try {
    // Fetching the contract ABI
    const response = await axios.get(contractABIUrl);
    const contractABI = response.data;

    // Initialize Ethers provider and wallet
    const provider = new ethers.JsonRpcProvider('https://rpc.laossigma.laosfoundation.io');
    const wallet = new ethers.Wallet(privateKey, provider);

    const contract = new ethers.Contract(laosCollectionAddr, contractABI, wallet);

    console.log(`Evolving asset with Token ID: ${tokenID}`);
    const tx = await contract.evolveWithExternalURI(tokenID, tokenURI);

    console.log('Transaction sent. Waiting for confirmation...');
    const receipt = await tx.wait();

    console.log('Transaction confirmed. Asset evolved in block number:', receipt.blockNumber);

    // Retrieve the token ID and the new tokenURI from the transaction receipt
    const event = receipt.logs.find(
      (log) => log.address.toLowerCase() === laosCollectionAddr.toLowerCase(),
    );
    if (event) {
      const iface = new ethers.Interface(contractABI);
      const decodedEvent = iface.decodeEventLog('EvolvedWithExternalURI', event.data, event.topics);
      console.log(`Evolved Token ID: ${decodedEvent._tokenId} to tokenURI ${decodedEvent._tokenURI}`);
    } else {
      console.log('Evolution event log not found.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
