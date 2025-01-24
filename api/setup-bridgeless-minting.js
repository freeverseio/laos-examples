require('dotenv').config();
const axios = require('axios');

// Specify the LAOS endpoint (choose between testnet or mainnet)
const LAOS_API_ENDPOINT = 'https://testnet.api.laosnetwork.io/graphql';

const createCollectionMutation = `
  mutation CreateCollection {
    createCollection(
      input: {
        name: "My Collection Name"
        symbol: "MCN"
        chainId: "137"
      }
    ) {
      chainId
      contractAddress
      laosAddress
      name
      success
      symbol
    }
  }
`;

const { LAOS_API_KEY } = process.env;
if (!LAOS_API_KEY) throw new Error('Please set LAOS_API_KEY in your .env file.');

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': `${LAOS_API_KEY}`,
};

async function setup() {
  try {
    console.log('API request sent. Please wait until the setup transactions are confirmed both on the EVM chain and LAOS. This is a one-time operation...');
    const response = await axios.post(
      LAOS_API_ENDPOINT,
      { query: createCollectionMutation },
      { headers },
    );

    if (response.data.errors) {
      console.error('Error:', response.data.errors);
      return;
    }

    const collectionData = response.data.data.createCollection;
    if (!collectionData.success) {
      console.log('Transaction failed');
      return;
    }
    console.log('Collection created successfully. Full API response:');
    console.log(collectionData);
    console.log(`
      - ERC721 deployed on the EVM chain (chaindId = ${collectionData.chainId}), managing the ownership / transfer of assets: ${collectionData.contractAddress}
      - The ERC721 points to the following sibling collection on LAOS, to be used for NFT minting and evolution: ${collectionData.laosAddress}
      `);
  } catch (error) {
    console.error('Error making API request:', error);
  }
}

setup();
