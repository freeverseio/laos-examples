/*
  Updates the metadata of an asset.
  The sender must be the owner of the collection in LAOS.
*/
/* eslint-disable no-underscore-dangle */
require('dotenv').config();
const { Web3 } = require('web3');
const axios = require('axios');

// Initialize Web3 instance with LAOS node provider. Public nodes:
// * LAOS Mainnet: https://rpc.laos.laosfoundation.io
// * LAOS Testnet: https://rpc.laossigma.laosfoundation.io
const web3 = new Web3('https://rpc.laos.laosfoundation.io');

// Environment variables
const privateKey = process.env.PRIVATE_KEY;

// The contract address of a collection in LAOS Sigma owned by the sender
const contractAddress = '0xfFFFfffFFffFFFfffffffFFE000000000000010A';

// The IPFS address with the updated metadata of the asset
const tokenURI = 'ipfs://QmPuwGA4tHHdog5R4w1TUGjVGf2zd1v6fXJZhiXgJ8a1Tj';

// The tokenID of the token to be updated
const tokenID = '99877789915310102870313747871528163330256470134196093056719091933329985338602';

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
    const gasPrice = await web3.eth.getGasPrice();
    const encodedABI = contract.methods.evolveWithExternalURI(tokenID, tokenURI).encodeABI();
    const fromAddress = web3.eth.accounts.privateKeyToAccount(privateKey).address;
    const gasEstimate = await web3.eth.estimateGas({
      to: contractAddress,
      data: encodedABI,
      from: fromAddress,
    });

    const transaction = {
      from: fromAddress,
      to: contractAddress,
      data: encodedABI,
      gas: gasEstimate,
      gasPrice,
    };

    // Sign and send the transaction
    const signedTx = await web3.eth.accounts.signTransaction(transaction, privateKey);
    console.log('Transaction sent. Waiting for confirmation...');

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    const blockNumber = await web3.eth.getBlockNumber();
    console.log('Current block number:', Number(blockNumber));
    console.log('Transaction confirmed. Asset evolved in block number:', Number(receipt.blockNumber));

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
