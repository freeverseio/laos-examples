require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');
const { createLAOSCollection } = require('./create-laos-collection');

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error('Please set PRIVATE_KEY in your .env file.');
}

function buildBaseURI(laosCollectionAddr, isLAOSMainnet) {
  const baseULOC = isLAOSMainnet
    ? 'https://uloc.io/GlobalConsensus(2)/Parachain(3370)/PalletInstance(51)'
    : 'GlobalConsensus(0:0x77afd6190f1554ad45fd0d31aee62aacc33c6db0ea801129acb813f913e0764f)/Parachain(4006)/PalletInstance(51)';
  return `${baseULOC}/AccountKey20(${laosCollectionAddr})/`;
}

async function deploy721(laosCollectionAddr, wallet) {
  console.log('Sender address:', wallet.address);

  // The URL of the interface ABI, loaded from GitHub for convenience
  const contractABIUrl = 'https://github.com/freeverseio/laos-erc721/blob/main/artifacts/contracts/ERC721Universal.sol/ERC721Universal.json?raw=true';

  // Fetching the contract ABI
  const response = await axios.get(contractABIUrl);
  const contractData = response.data;

  const contractFactory = new ethers.ContractFactory(
    contractData.abi,
    contractData.bytecode,
    wallet,
  );

  console.log('Deploying ERC721 contract...');
  const baseURI = buildBaseURI(laosCollectionAddr, false);
  const instance = await contractFactory.deploy(wallet.address, 'testname', 'testsymbol', baseURI);
  console.log('Waiting for deployment to be mined...');
  await instance.waitForDeployment();

  console.log('Contract successfully deployed at address:', await instance.getAddress());
  return instance.getAddress();
}

async function main() {
  try {
    // const providerLaos = new ethers.JsonRpcProvider('https://rpc.laossigma.laosfoundation.io');
    // const walletLaos = new ethers.Wallet(privateKey, providerLaos);
    // const collectionAddrLaos = await createLAOSCollection(walletLaos);
    // console.log('LAOS sibling collection successfully created at address:', collectionAddrLaos);

    const collectionAddrLaos = '0xfffFfFffffFffFfFFfFFffFE0000000000000196';
    const providerEVM = new ethers.JsonRpcProvider('https://polygon-bor-rpc.publicnode.com');
    const walletEVM = new ethers.Wallet(privateKey, providerEVM);
    console.log('Deploying 721...');
    const collectionAddrEVM = await deploy721(collectionAddrLaos, walletEVM);
    console.log('ERC721 successfully deployed at address:', collectionAddrEVM);
  } catch (error) {
    console.error('Error in test script:', error.message || error);
  }
}

if (require.main === module) {
  main();
}
