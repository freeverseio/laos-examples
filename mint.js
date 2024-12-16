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

// The address of the recipient of the asset
const recipient = '0xA818cEF865c0868CA4cC494f673FcDaAD6a77cEA';

// The contract address of a collection in LAOS Sigma testnet.
// Check the create-laos-collection.js script if you need to create one.
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
const laosCollectionAddr = '0xFFFfFFFffFfFfffFFffFffFe0000000000000191';

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

    // Initialize Ethers provider and wallet
    const provider = new ethers.JsonRpcProvider('https://rpc.laossigma.laosfoundation.io');
    const wallet = new ethers.Wallet(privateKey, provider);

    const contract = new ethers.Contract(laosCollectionAddr, contractABI, wallet);

    // Generate a random slot number
    const slot = getRandomBigInt(2n ** 96n - 1n);

    console.log(`Minting asset to recipient: ${recipient}`);
    const tx = await contract.mintWithExternalURI(recipient, slot, tokenURI);

    console.log('Transaction sent. Waiting for confirmation...');
    const receipt = await tx.wait();

    console.log('Transaction confirmed. Asset minted in block number:', receipt.blockNumber);

    // Retrieve the token ID from the transaction receipt
    const event = receipt.logs.find(
      (log) => log.address.toLowerCase() === laosCollectionAddr.toLowerCase(),
    );
    if (event) {
      const iface = new ethers.Interface(contractABI);
      const decodedEvent = iface.decodeEventLog('MintedWithExternalURI', event.data, event.topics);
      console.log(`New Token ID: ${decodedEvent._tokenId}`);
    } else {
      console.log('Mint event log not found.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
