require('dotenv').config();
const axios = require('axios');

// Specifify the chainID where the uERC721 is deployed, and its contractAddress:
const chainId = 137;
const contractAddress = '0x7eaf767be3c72d422d59be7c318161e4420c15d1';

// Specify the LAOS endpoint (choose between testnet or mainnet)
const LAOS_API_ENDPOINT = 'https://testnet.api.laosnetwork.io/graphql';

// The API Key should be on the .env file
const { LAOS_API_KEY } = process.env;
if (!LAOS_API_KEY) throw new Error('Please set LAOS_API_KEY in your .env file.');

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': `${LAOS_API_KEY}`,
};

const evolveMutation = `
  mutation EvolveNFT {
    evolveBatch(
      input: {
        chainId: "${chainId}"
        contractAddress: "${contractAddress}"
        tokens: [
          {
            tokenId: "84345524707560823119048121584012148114012579678921297377141744356137354038901",
            name: "First NFT Evolved",
            description: "First NFT Description Evolved",
            attributes: [{ trait_type: "Category", value: "Example Evolved" }],
            image: "ipfs://HASH_AA"
          },
          {
            tokenId: "20720131098342415923691492217621056541908060861074540068716680168395544628853",
            name: "Second NFT Evolved",
            description: "Second NFT Description Evolved",
            attributes: [{ trait_type: "Category", value: "Example Evolved" }],
            image: "ipfs://HASH_BB"
          }
        ]
      }
    ) {
      tx
      success
    }
  }
`;

async function evolveNFT() {
  try {
    console.log('API request sent. Please wait until the mint transaction is confirmed on LAOS...');
    const response = await axios.post(
      LAOS_API_ENDPOINT,
      { query: evolveMutation },
      { headers },
    );

    if (response.data.errors) {
      console.error('Error:', response.data.errors);
      return;
    }

    const evolveData = response.data.data.evolveBatch;
    console.log(`The NFTs were evolved successfully. The response includes the hash of transaction sent to chain ${chainId}:`);
    console.log(evolveData);
  } catch (error) {
    console.error('Error making API request:', error);
  }
}

evolveNFT();
