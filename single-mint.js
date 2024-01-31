/*
  Mints a single asset in the LAOS sibling collection,
  hence filling the corresponding slot created in the
  ERC721 deployed in another chain.
  The sender must be the owner of the collection in LAOS.
*/
/* eslint-disable no-underscore-dangle */
require('dotenv').config();
const { Web3 } = require('web3');
const axios = require('axios');

// Initialize Web3 instance with LAOS node provider
const web3 = new Web3('https://rpc.klaos.laosfoundation.io');

// Environment variables
const privateKey = process.env.PRIVATE_KEY;

// The address of the recipient of the NFT
const toAddress = '0xA818cEF865c0868CA4cC494f673FcDaAD6a77cEA';

// The contract address of a collection in KLAOS owned by the sender
const contractAddress = '0xffFfFfFffFFFfFfFFFffFFfE00000000000000b6';

// The IPFS address with the metadata of the asset to be minted
const tokenURI = 'ipfs://QmPuwGA4tHHdog5R4w1TUGjVGf2zd1v6fXJZhiXgJ8a1Tj';

// The URL of the interface ABI, from GitHub
const contractABIUrl = 'https://github.com/freeverseio/laos/blob/main/ownership-chain/precompile/evolution-collection/contracts/EvolutionCollection.json?raw=true';

// Generates a random integer between 0 and max
function getRandomBigInt(max) {
  return (BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)) ** 2n) % BigInt(max);
}

async function main() {
  try {
    // Fetching the contract ABI
    const response = await axios.get(contractABIUrl);
    const contractABI = response.data;

    // Instantiating the contract
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    // Generate a random slot number
    const slot = getRandomBigInt(2n ** 96n - 1n);

    // Prepare the mint transaction
    const encodedABI = contract.methods.mintWithExternalURI(toAddress, slot, tokenURI).encodeABI();
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
    console.log('Transaction confirmed. Asset minted in block number:', receipt.blockNumber);

    // Retrieve the token ID from the transaction receipt
    const mintEventABI = contractABI.find((abi) => abi.name === 'MintedWithExternalURI' && abi.type === 'event');
    const mintEvent = receipt.logs.find(
      (log) => log.address.toLowerCase() === contractAddress.toLowerCase(),
    );
    if (mintEvent && mintEventABI) {
      const decodedLog = web3.eth.abi.decodeLog(
        mintEventABI.inputs,
        mintEvent.data,
        mintEvent.topics.slice(1),
      );
      console.log(`Token ID: ${decodedLog._tokenId}`);
    } else {
      console.log('Mint event log not found.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
