require('dotenv').config();
const { ethers } = require('ethers');
const { createCollection } = require('./create-laos-collection');

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error('Please set PRIVATE_KEY in your .env file.');
}

async function deploy721(laosCollectionAddr, wallet) {
  // The URL of the interface ABI, loaded from GitHub for convenience
  const contractABIUrl = 'https://github.com/freeverseio/laos-erc721/blob/main/abi/contracts/ERC721Universal.sol/ERC721Universal.json?raw=true';

  // Fetching the contract ABI
  const response = await axios.get(contractABIUrl);
  const contractABI = response.data;


}




async function main() {
  try {
    const providerLaos = new ethers.JsonRpcProvider('https://rpc.laossigma.laosfoundation.io');
    const walletLaos = new ethers.Wallet(privateKey, providerLaos);
    console.log('Starting test script for createCollection...');
    const collectionAddress = await createCollection(walletLaos);
    console.log('Test complete. Collection successfully created at address:', collectionAddress);

    const providerEVM = new ethers.JsonRpcProvider('https://rpc.laossigma.laosfoundation.io');
    const walletLaos = new ethers.Wallet(privateKey, providerLaos);
    console.log('Starting test script for createCollection...');
    const collectionAddress = await createCollection(walletLaos);
    console.log('Test complete. Collection successfully created at address:', collectionAddress);



  } catch (error) {
    console.error('Error in test script:', error.message || error);
  }
}

if (require.main === module) {
  main();
}
