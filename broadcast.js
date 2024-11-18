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
const { Web3 } = require('web3');
const BN = require('bn.js');
const axios = require('axios');

// Environment variables
const privateKey = process.env.PRIVATE_KEY;

/*
This example will use the public collection on Polygon PoS:
 - Opensea Collection: https://opensea.io/collection/laos-bridgeless-minting-on-polygon-1
 - Polygon uERC-721 contract: 0x0Cf5Fc5b64d60c13894328b16042a4D8F8398EbF
 - LAOS Sigma sibling collection: 0xfFFfFffffFffFFfFFffffffe000000000000000D
*/

// Initialize Web3 instance connected to a node provider of an ownership chain (e.g. Polygon PoS)
const web3 = new Web3('https://polygon.llamarpc.com');

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

    // Instantiating the contract
    const contract = new web3.eth.Contract(contractABI, uERC721Address);

    // Fetch the current gas price (EIP-1559)
    const { baseFeePerGas } = await web3.eth.getBlock('pending');
    const maxPriorityFeePerGas = web3.utils.toWei('30', 'gwei');
    const maxFeePerGas = new BN(baseFeePerGas).add(new BN(maxPriorityFeePerGas));

    // Prepare the mint transaction
    const encodedABI = contract.methods.broadcastSelfTransfer(tokenId).encodeABI();
    const fromAddress = web3.eth.accounts.privateKeyToAccount(privateKey).address;
    const transaction = {
      from: fromAddress,
      to: uERC721Address,
      data: encodedABI,
      maxPriorityFeePerGas,
      maxFeePerGas: maxFeePerGas.toString(),
    };

    // Sign and send the transaction
    const signedTx = await web3.eth.accounts.signTransaction(transaction, privateKey);
    console.log('Transaction sent. Waiting for confirmation...');

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    const blockNumber = await web3.eth.getBlockNumber();
    console.log('Current block number:', blockNumber.toString());
    console.log('Transaction confirmed. Asset broadcasted in block number:', receipt.blockNumber.toString());

    // Retrieve the token ID from the transaction receipt
    const transferABI = contractABI.find((abi) => abi.name === 'Transfer' && abi.type === 'event');
    const transferEvent = receipt.logs.find(
      (log) => log.address.toLowerCase() === uERC721Address.toLowerCase(),
    );
    if (transferEvent && transferABI) {
      const decodedLog = web3.eth.abi.decodeLog(
        transferABI.inputs,
        transferEvent.data,
        transferEvent.topics.slice(1),
      );
      console.log(`Broadcasted Token ID: ${decodedLog.tokenId}`);
      console.log(`If you used the Polygon example, the asset should be tradeable on Opensea at: https://opensea.io/assets/matic/${uERC721Address}/${tokenId}`);
    } else {
      console.log('Broadcast event log not found.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
