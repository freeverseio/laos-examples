require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');

const { PRIVATE_KEY } = process.env;
if (!PRIVATE_KEY) {
  throw new Error('Please set PRIVATE_KEY in your .env file.');
}

const PROVIDER_URL = 'https://polygon-bor-rpc.publicnode.com';

function buildBaseURI(laosCollectionAddr, isLAOSMainnet) {
  const baseULOC = isLAOSMainnet
    ? 'https://uloc.io/GlobalConsensus(2)/Parachain(3370)/PalletInstance(51)'
    : 'GlobalConsensus(0:0x77afd6190f1554ad45fd0d31aee62aacc33c6db0ea801129acb813f913e0764f)/Parachain(4006)/PalletInstance(51)';
  return `${baseULOC}/AccountKey20(${laosCollectionAddr})/`;
}

/**
 * Deploys a new uERC721 on the EVM chain specified by its RPC node
 * @param {ethers.AddressLike} laosCollectionAddr - The sibling collection address on LAOS
 * @param {ethers.Wallet} wallet - The ethers.js wallet instance.
 * @returns {Promise<string>} - The address of the deployed contract
 */
async function deploy721(laosCollectionAddr, wallet) {
  const CONTRACT_ABI_URL = 'https://github.com/freeverseio/laos-erc721/blob/main/artifacts/contracts/ERC721Universal.sol/ERC721Universal.json?raw=true';
  const response = await axios.get(CONTRACT_ABI_URL);
  const contractData = response.data;

  const contractFactory = new ethers.ContractFactory(
    contractData.abi,
    contractData.bytecode,
    wallet,
  );

  console.log('Deploying ERC721 contract...');
  const baseURI = buildBaseURI(laosCollectionAddr, false);
  const instance = await contractFactory.deploy(wallet.address, 'testname', 'testsymbol', baseURI);
  console.log('Transaction sent. Waiting for confirmation...');
  await instance.waitForDeployment();
  console.log('Transaction confirmed.');
  return instance.getAddress();
}

async function main() {
  const collectionAddrLaos = '0xfffFfFffffFffFfFFfFFffFE0000000000000196';
  const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log('Deployer address:', wallet.address);
  const collectionAddress = await deploy721(collectionAddrLaos, wallet);
  console.log('ERC721 successfully deployed at address:', collectionAddress);
}

if (require.main === module) {
  main();
}
