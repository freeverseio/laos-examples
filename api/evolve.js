require('dotenv').config();
const axios = require('axios');

// Specifify the chainID where the uERC721 is deployed, and its contractAddress:
const chainId = 137;
const contractAddress = '0x1b37032445e9bc6b13669357a0a44490e8052c9f';

// Specify the LAOS endpoint (choose between testnet or mainnet)
const LAOS_API_ENDPOINT = 'https://testnet.api.laosnetwork.io/graphql';

// The API Key should be on the .env file
const { LAOS_API_KEY } = process.env;
if (!LAOS_API_KEY) throw new Error('Please set LAOS_API_KEY in your .env file.');

const evolveMutation = `
  mutation EvolveNFT {
    evolveBatch(
      input: {
        chainId: "${chainId}"
        contractAddress: "${contractAddress}"
        tokens: [
          {
            tokenId: "83834123087411776487146708352711876309124697616080602758242164335421823290997",
            name: "First NFT Evolved",
            description: "First NFT Description Evolved",
            attributes: [{ trait_type: "Category", value: "Example Evolved" }],
            image: "ipfs://HASH_AA"
          },
          {
            tokenId: "95908609784828203441863748079688753062533515066747621617011273368585779711605",
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

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': `${LAOS_API_KEY}`,
};

async function evolveNFT() {
  try {
    console.log('API request sent. Please wait until the evolve transaction is confirmed on LAOS...');
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
    console.log('The NFTs were evolved successfully. The response includes the hash of transaction sent to LAOS:');
    console.log(evolveData);
  } catch (error) {
    console.error('Error making API request:', error);
  }
}

evolveNFT();
