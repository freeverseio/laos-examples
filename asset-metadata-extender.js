/* eslint-disable import/no-extraneous-dependencies */
/*
  Permissionlessly extends the metadata of any asset in any chain
  If the same sender has a previous extension of the same asset,
  the TX will revert. Use the corresponding update method in such case.
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

// The universal location of the asset to be extended (in Ethereum, hennce the 7:1)
const assetUniversalLocation = 'uloc://GlobalConsensus(7:1)/AccountKey20(0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d)/GeneralKey(3099)';

// The ipfs address containing the newly added metadata
const tokenURI = 'ipfs://QmPuwGA4tHHdog5R4w1TUGjVGf2zd1v6fXJZhiXgJ8a1Tj';

// This address of the precompiled contract offering metadata extensions at protocol level:
const contractAddress = '0x0000000000000000000000000000000000000405';

// The GitHub URL containing the interface to the contract:
const contractABIUrl = 'https://github.com/freeverseio/laos/blob/main/pallets/asset-metadata-extender/src/precompiles/asset_metadata_extender/contracts/AssetMetadataExtender.json?raw=true';

async function main() {
  try {
    // Fetching the contract ABI
    const response = await axios.get(contractABIUrl);
    const contractABI = response.data;

    // Initialize Ethers provider and wallet
    const provider = new ethers.JsonRpcProvider('https://rpc.laossigma.laosfoundation.io');
    const wallet = new ethers.Wallet(privateKey, provider);

    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

    console.log(`Evolving asset at universal location: ${assetUniversalLocation}`);
    const tx = await contract.extendULWithExternalURI(assetUniversalLocation, tokenURI);

    console.log('Transaction sent. Waiting for confirmation...');
    const receipt = await tx.wait();

    console.log('Transaction confirmed. Asset metadata extended in block number:', receipt.blockNumber);

    // Retrieve the data emitted in the corresponding event from the transaction receipt
    const event = receipt.logs.find(
      (log) => log.address.toLowerCase() === contractAddress.toLowerCase(),
    );
    if (event) {
      const iface = new ethers.Interface(contractABI);
      const decodedEvent = iface.decodeEventLog('ExtendedULWithExternalURI', event.data, event.topics);
      console.log(`Asset with universal location: ${decodedEvent._universalLocation} extended with tokenURI ${decodedEvent._tokenURI}`);
    } else {
      console.log('Extension event log not found.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
