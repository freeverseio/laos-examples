/*
  Sets up an EVM chain that uses bridgeless minting on LAOS to scale.
  It first creates a collection on the LAOS Network. Once created,
  the collection's address is used to deploy an ERC721 contract on
  the EVM chain, which links to the LAOS collection as its sibling.
*/
/* eslint-disable max-len */
require('dotenv').config();
const { ethers } = require('ethers');
const { createLAOSCollection } = require('./create-laos-collection');
const { deploy721 } = require('./deploy721');

// For this script, the deployer account needs to have funds on both LAOS and the EVM chain:
const { PRIVATE_KEY } = process.env;
if (!PRIVATE_KEY) throw new Error('Please set PRIVATE_KEY in your .env file.');

// Choose an RPC provider for the EVM chain where the uERC721 will be deployed:
const EVM_PROVIDER_URL = 'https://polygon-bor-rpc.publicnode.com';

// Set to true if you want to use LAOS Mainet, set to false for LAOS Sigma testnet:
const USE_LAOS_MAINNET = true;

// The default public nodes for LAOS:
const LAOS_MAINNET_URL = 'https://rpc.laos.laosfoundation.io';
const LAOS_TESTNET_URL = 'https://rpc.laossigma.laosfoundation.io';

async function main() {
  // Create the sibling collection on LAOS:
  const providerLaos = new ethers.JsonRpcProvider(USE_LAOS_MAINNET ? LAOS_MAINNET_URL : LAOS_TESTNET_URL);
  const walletLaos = new ethers.Wallet(PRIVATE_KEY, providerLaos);
  console.log('Deployer address:', walletLaos.address);
  const collectionAddrLaos = await createLAOSCollection(walletLaos);
  console.log('LAOS sibling collection successfully created at address:', collectionAddrLaos);

  const laosSiblingCollection = {
    isLAOSMainnet: USE_LAOS_MAINNET,
    address: collectionAddrLaos,
  };

  // Deploy the uERC721 on the EVM chain, linked to the sibling collection on LAOS:
  const providerEVM = new ethers.JsonRpcProvider(EVM_PROVIDER_URL);
  const walletEVM = new ethers.Wallet(PRIVATE_KEY, providerEVM);
  const collectionAddrEVM = await deploy721(laosSiblingCollection, walletEVM);
  console.log('ERC721 successfully deployed at address:', collectionAddrEVM);
}

if (require.main === module) {
  main();
}
