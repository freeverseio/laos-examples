/*
  Creates a sibling collection in LAOS. The newly created contract address
  can be used to deploy an ERC721 in any chain, pointing to this contract.
*/
/* eslint-disable no-underscore-dangle */
require('dotenv').config();
const { Web3 } = require('web3');
const axios = require('axios');

// Initialize Web3 instance with LAOS node provider
const web3 = new Web3('https://rpc.klaos.laosfoundation.io');

// Environment variables
const privateKey = process.env.PRIVATE_KEY;

// The contract address exposing collection creation
const contractAddress = '0x0000000000000000000000000000000000000403';

// The URL of the interface ABI, from GitHub
const contractABIUrl = 'https://github.com/freeverseio/laos/blob/main/ownership-chain/precompile/evolution-collection-factory/contracts/EvolutionCollectionFactory.json?raw=true';

async function main() {
  try {
    // Fetching the contract ABI
    const response = await axios.get(contractABIUrl);
    const contractABI = response.data;

    // Instantiating the contract
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    // Prepare the transaction
    const gasPrice = await web3.eth.getGasPrice(); // Get current gas price
    const encodedABI = contract.methods.createCollection(
      web3.eth.accounts.privateKeyToAccount(privateKey).address,
    ).encodeABI();
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    const transaction = {
      to: contractAddress,
      data: encodedABI,
      gas: 45000,
      gasPrice,
      nonce: await web3.eth.getTransactionCount(account.address),
    };

    // Sign and send the transaction
    const signedTx = await web3.eth.accounts.signTransaction(transaction, privateKey);
    console.log('Transaction sent. Waiting for confirmation...');

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('Transaction confirmed. Collection created in block number:', receipt.blockNumber);

    // Retrieve the contract address from the transaction receipt
    const newCollectionEventABI = contractABI.find((abi) => abi.name === 'NewCollection' && abi.type === 'event');
    const newCollectionEvent = receipt.logs.find(
      (log) => log.address.toLowerCase() === contractAddress.toLowerCase(),
    );
    if (newCollectionEvent && newCollectionEventABI) {
      const decodedLog = web3.eth.abi.decodeLog(
        newCollectionEventABI.inputs,
        newCollectionEvent.data,
        newCollectionEvent.topics.slice(1),
      );
      console.log(`Contract address: ${decodedLog._collectionAddress}`);
    } else {
      console.log('New collection event log not found.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
