/*
  Permissionlessly extends the metadata of any asset in any chain
  If the same sender has a previous extension of the same asset,
  the TX will revert. Use the corresponding update method in such case.
*/
/* eslint-disable no-underscore-dangle */
require('dotenv').config();
const { Web3 } = require('web3');
const axios = require('axios');

// Initialize Web3 instance with LAOS node provider
const web3 = new Web3('https://rpc.laossigma.laosfoundation.io');

// Environment variables
const privateKey = process.env.PRIVATE_KEY;

// The universal location of the asset to be extended (in Ethereum, because of 7:1)
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

    // Instantiating the contract
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    // Prepare the transaction
    const gasPrice = await web3.eth.getGasPrice(); // Get current gas price
    const encodedABI = contract.methods.extendULWithExternalURI(
      assetUniversalLocation,
      tokenURI,
    ).encodeABI();
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    const transaction = {
      to: contractAddress,
      data: encodedABI,
      gas: 100000,
      gasPrice,
      nonce: await web3.eth.getTransactionCount(account.address),
    };

    // Sign and send the transaction
    const signedTx = await web3.eth.accounts.signTransaction(transaction, privateKey);
    console.log('Transaction sent. Waiting for confirmation...');

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('Transaction confirmed. Asset Metadata extension created in block number:', receipt.blockNumber);

    // Decode the log to find the universal location
    const ExtensionEventABI = contractABI.find((abi) => abi.name === 'ExtendedULWithExternalURI' && abi.type === 'event');
    const ExtensionEvent = receipt.logs.find(
      (log) => log.address.toLowerCase() === contractAddress.toLowerCase(),
    );
    if (ExtensionEvent && ExtensionEventABI) {
      const decodedLog = web3.eth.abi.decodeLog(
        ExtensionEventABI.inputs,
        ExtensionEvent.data,
        ExtensionEvent.topics.slice(1),
      );
      console.log(`New asset metadata extension created with ID: ${decodedLog._universalLocation}`);
    } else {
      console.log('Extension event log not found.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
