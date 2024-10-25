/*
  Updates the metadata of an asset.
  The sender must be the owner of the collection in LAOS.
*/
/* eslint-disable no-underscore-dangle */
require('dotenv').config();
const { Web3 } = require('web3');
const axios = require('axios');

// Initialize Web3 instance with LAOS node provider
const web3 = new Web3('https://rpc.laossigma.laosfoundation.io');

// Environment variables
const privateKey = process.env.PRIVATE_KEY;

// The contract address of a collection in KLAOS owned by the sender
const contractAddress = '0xfFfFffFFfFfFFFFFFffFfffE0000000000000113';

// The IPFS address with the updated metadata of the asset
const tokenURI = 'ipfs://QmWYkoWJg9p3ndMBV91TviaHGNywoSnztUHWwJot7fuz6Y';

// The tokenID of the token to be updated
const tokenID = '54227173012980701237119388165985623609204732016578329839312404345222829931754';

// The URL of the interface ABI, from GitHub
const contractABIUrl = 'https://github.com/freeverseio/laos/blob/main/pallets/laos-evolution/src/precompiles/evolution_collection/contracts/EvolutionCollection.json?raw=true';

async function main() {
  try {
    // Fetching the contract ABI
    const response = await axios.get(contractABIUrl);
    const contractABI = response.data;

    // Instantiating the contract
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    // Prepare the evolve transaction
    const encodedABI = contract.methods.evolveWithExternalURI(tokenID, tokenURI).encodeABI();
    const fromAddress = web3.eth.accounts.privateKeyToAccount(privateKey).address;
    const transaction = {
      from: fromAddress,
      to: contractAddress,
      data: encodedABI,
      gas: 35000,
      gasPrice: web3.utils.toWei('0.5', 'gwei'), // Set the desired gas price
    };

    // Sign and send the transaction
    const signedTx = await web3.eth.accounts.signTransaction(transaction, privateKey);
    console.log('Transaction sent. Waiting for confirmation...');

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    const blockNumber = await web3.eth.getBlockNumber();
    console.log('Current block number:', blockNumber);
    console.log('Transaction confirmed. Asset evolved in block number:', receipt.blockNumber);

    // Retrieve the token ID from the transaction receipt
    const evolveEventABI = contractABI.find((abi) => abi.name === 'EvolvedWithExternalURI' && abi.type === 'event');
    const evolveEvent = receipt.logs.find(
      (log) => log.address.toLowerCase() === contractAddress.toLowerCase(),
    );
    if (evolveEvent && evolveEventABI) {
      const decodedLog = web3.eth.abi.decodeLog(
        evolveEventABI.inputs,
        evolveEvent.data,
        evolveEvent.topics.slice(1),
      );
      console.log(`Token ID: ${decodedLog._tokenId}`);
    } else {
      console.log('Evolve event log not found.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
