require('dotenv').config();
const axios = require('axios');

// Specify the chainID where the uERC721 is deployed, and its contractAddress:
const chainId = 137;
const contractAddress = '0xc3804be6b4a46a3bacf80a1578627cbd780da765';

const LAOS_API_ENDPOINT = 'https://api.laosnetwork.io/v2/graphql';

const evolveMutation = `
  mutation EvolveNFT {
    evolve(
      input: {
        chainId: "${chainId}"
        contractAddress: "${contractAddress}"
        tokens: [
          {
            tokenId: "50502549627280074407685528558609263714988406390634121482157775721415968984693",
            name: "First NFT Evolved",
            description: "First NFT Description Evolved",
            attributes: [{ trait_type: "Category", value: "Example Evolved" }],
            image: "ipfs://HASH_AA"
          },
          {
            tokenId: "76048270991214929416358059255712998230007213781641365826564680735053877251701",
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

const { LAOS_API_KEY } = process.env;
if (!LAOS_API_KEY) throw new Error('Please set LAOS_API_KEY in your .env file.');

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

    const evolveData = response.data.data.evolve;
    if (!evolveData.success) {
      console.log('Transaction failed');
      return;
    }
    console.log('The NFTs were evolved successfully. The response includes the hash of transaction sent to LAOS:');
    console.log(evolveData);
  } catch (error) {
    console.error('Error making API request:', error);
  }
}

evolveNFT();
