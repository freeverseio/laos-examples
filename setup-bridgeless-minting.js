require('dotenv').config();
const { ethers } = require('ethers');
const { createCollection } = require('./create-laos-collection');

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error('Please set PRIVATE_KEY in your .env file.');
}

async function main() {
  try {
    const provider = new ethers.JsonRpcProvider('https://rpc.laossigma.laosfoundation.io');
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log('Starting test script for createCollection...');
    const collectionAddress = await createCollection(wallet);
    console.log('Test complete. Collection successfully created at address:', collectionAddress);
  } catch (error) {
    console.error('Error in test script:', error.message || error);
  }
}

if (require.main === module) {
  main();
}
