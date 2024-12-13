/* eslint-disable import/no-extraneous-dependencies */
/*
  Executes the Broadcast method on a deployed uERC721 contract

  Bridgelessly minted assets are ready to be traded on chain, for example,
  using Etherscan/Polygonscan, by importing them to Metamask and using "Send",
  or by using your favorite web3 library connected to Ethereum/Polygon, etc.
  To appear in Opensea & marketplaces that use event-based indexers, and which
  still don't use the uNode, you will either need to 'Send' it first, or
  execute a broadcast transaction.

  The front end at https://testnet.apps.laosnetwork.io/asset/<networkId>/<uERC721Address>/<tokenID>
  can be used to facilitate importing to Metamask and broadcasting.
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

/*
This example will use the public collection on Polygon PoS:
 - Opensea Collection: https://opensea.io/collection/laos-bridgeless-minting-on-polygon-1
 - Polygon uERC-721 contract: 0x0Cf5Fc5b64d60c13894328b16042a4D8F8398EbF
 - LAOS Sigma sibling collection: 0xfFFfFffffFffFFfFFffffffe000000000000000D
*/

// The contract address on Polygon and the tokenId of the asset to be broadcasted 
const uERC721Address = '0x0cf5fc5b64d60c13894328b16042a4d8f8398ebf';
const tokenId = '51102759750158299704424093372560085818180704509134110948726375946946599308584';

// The URL of the interface ABI, loaded from GitHub for convenience
const contractABIUrl = 'https://github.com/freeverseio/laos-erc721/blob/main/abi/contracts/ERC721Universal.sol/ERC721Universal.json?raw=true';

async function main() {
  try {
    // Fetching the contract ABI
    const response = await axios.get(contractABIUrl);
    const contractABI = response.data;

    // Initialize Ethers provider and wallet
    const provider = new ethers.JsonRpcProvider('https://polygon.drpc.org');
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log('Sender address:', wallet.address);

    const contract = new ethers.Contract(uERC721Address, contractABI, wallet);

    console.log(`Broadcasting asset with TokenId: ${tokenId}`);
    const tx = await contract.broadcastSelfTransfer(tokenId);

    console.log('Transaction sent. Waiting for confirmation...');
    const receipt = await tx.wait();

    console.log('Transaction confirmed. Asset minted in block number:', receipt.blockNumber);

    // Retrieve the data emitted in the corresponding event from the transaction receipt
    const event = receipt.logs.find(
      (log) => log.address.toLowerCase() === uERC721Address.toLowerCase(),
    );
    if (event) {
      const iface = new ethers.Interface(contractABI);
      const decodedEvent = iface.decodeEventLog('Transfer', event.data, event.topics);
      console.log(`Broadcasted asset with Token ID: ${decodedEvent.tokenId}`);
    } else {
      console.log('Broadcast event log not found.');
      console.log(`If you used the Polygon example, the asset should be tradeable on Opensea at: https://opensea.io/assets/matic/${uERC721Address}/${tokenId}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
