require('dotenv').config();
const axios = require('axios');

const LAOS_API_ENDPOINT = 'https://testnet.api.laosnetwork.io/graphql';
const { LAOS_API_KEY } = process.env;
if (!LAOS_API_KEY) throw new Error('Please set LAOS_API_KEY in your .env file.');

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': `${LAOS_API_KEY}`,
};

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

async function setup() {
  try {
    const response = await axios.post(
      LAOS_API_ENDPOINT,
      { query: createCollectionMutation },
      { headers },
    );

    if (response.data.errors) {
      console.error('Error setting up collection:', response.data.errors);
      return;
    }
    console.log('Collection created successfully:', response.data.createCollection);
  } catch (error) {
    console.error('Error making API request:', error);
  }
}

setup();
