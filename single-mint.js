/*
  Mints a single asset in the LAOS sibling collection,
  hence filling the corresponding slot created in the
  ERC721 deployed in another chain.
  The sender must be the owner of the collection on LAOS.

  Bridgelessly minted assets are ready to be traded on chain, for example,
  using Etherscan/Polygonscan, by importing them to Metamask and using "Send",
  or by using your favorite web3 library connected to Ethereum/Polygon, etc.
  To appear in Opensea & marketplaces that use event-based indexers, and which
  still don't use the uNode, you will either need to 'Send' it first, or
  execute a broadcast transaction.

  The front end at https://testnet.apps.laosnetwork.io/asset/<networkId>/<uERC721_address>/<tokenID>
  can be used to facilitate importing to Metamask and broadcasting.
  */
/* eslint-disable no-underscore-dangle */
require('dotenv').config();
const { Web3 } = require('web3');
const axios = require('axios');

// Initialize Web3 instance with LAOS node provider. Public nodes:
// * LAOS Mainnet: https://rpc.laos.laosfoundation.io
// * LAOS Testnet: https://rpc.laossigma.laosfoundation.io
const web3 = new Web3('https://rpc.laossigma.laosfoundation.io');

// Environment variables
const privateKey = process.env.PRIVATE_KEY;

// The address of the recipient of the asset
const recipient = '0xA818cEF865c0868CA4cC494f673FcDaAD6a77cEA';

// The contract address of a collection in LAOS Sigma testnet.
// This must either be a collection owned by the sender,
// or a collection with Public Minting enabled.
// As examples, the following two uERC-721 contracts point to sibling LAOS Sigma
// collections that currently have Public Minting enabled:
// Ethereum:
//   Ethereum uERC-721 contract: 0xee5B64092Fb09a219baa4D0DF909ED730A85c67e
//   LAOS Sigma sibling collection: 0xFFfFfFFFfFFFfFfFfffFfffe000000000000000e
// Polygon:
//   Opensea Collection: https://opensea.io/collection/laos-bridgeless-minting-on-polygon-1
//   Polygon uERC-721 contract: 0x0Cf5Fc5b64d60c13894328b16042a4D8F8398EbF
//   LAOS Sigma sibling collection: 0xfFFfFffffFffFFfFFffffffe000000000000000D

const laosCollectionAddr = '0xfFFFfffFFffFFFfffffffFFE000000000000010A';

// The IPFS address with the metadata of the asset to be minted.
// You can use the ipfs-uploader.js script in these examples to
// create a valid IPFS address.
// The address must start with 'ipfs://....'
const tokenURI = 'ipfs://QmPuwGA4tHHdog5R4w1TUGjVGf2zd1v6fXJZhiXgJ8a1Tj';

// The URL of the interface ABI, loaded from the LAOS GitHub for convenience
const contractABIUrl = 'https://github.com/freeverseio/laos/blob/main/pallets/laos-evolution/src/precompiles/evolution_collection/contracts/EvolutionCollection.json?raw=true';

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
    const contract = new web3.eth.Contract(contractABI, laosCollectionAddr);

    // Generate a random slot number
    const slot = getRandomBigInt(2n ** 96n - 1n);

    // Prepare the mint transaction
    const gasPrice = await web3.eth.getGasPrice();
    const encodedABI = contract.methods.mintWithExternalURI(recipient, slot, tokenURI).encodeABI();
    const fromAddress = web3.eth.accounts.privateKeyToAccount(privateKey).address;
    const gasEstimate = await web3.eth.estimateGas({
      to: laosCollectionAddr,
      data: encodedABI,
      from: fromAddress,
    });

    const transaction = {
      from: fromAddress,
      to: laosCollectionAddr,
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
    console.log('Transaction confirmed. Asset minted in block number:', Number(receipt.blockNumber));

    // Retrieve the token ID from the transaction receipt
    const mintEventABI = contractABI.find((abi) => abi.name === 'MintedWithExternalURI' && abi.type === 'event');
    const mintEvent = receipt.logs.find(
      (log) => log.address.toLowerCase() === laosCollectionAddr.toLowerCase(),
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
