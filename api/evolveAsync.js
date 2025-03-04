/* eslint-disable no-await-in-loop */
require('dotenv').config();
const axios = require('axios');

// Specify the chainID where the uERC721 is deployed, and its contractAddress:
const chainId = 137;
const contractAddress = '0xc3804be6b4a46a3bacf80a1578627cbd780da765';

const LAOS_API_ENDPOINT = 'https://api.laosnetwork.io/v2/graphql';

const evolveAsyncMutation = `
  mutation EvolveNFT {
    evolveAsync(
      input: {
        chainId: "${chainId}"
        contractAddress: "${contractAddress}"
        tokens: [
          {
            tokenId: "520463665441982649906516481606370360392698873000003692741498890886073978485",
            name: "First NFT Evolved",
            description: "First NFT Description Evolved",
            attributes: [{ trait_type: "Category", value: "Example Evolved" }],
            image: "ipfs://HASH_AA"
          },
          {
            tokenId: "96856026251759042895449182525818246039289479624169736146446469174135404793461",
            name: "Second NFT Evolved",
            description: "Second NFT Description Evolved",
            attributes: [{ trait_type: "Category", value: "Example Evolved" }],
            image: "ipfs://HASH_BB"
          }
        ]
      }
    ) {
      trackingId
      status
    }
  }
`;

const evolveResponseQuery = `
  query evolveNFTResponse {
    evolveResponse(trackingId: "%TRACKING_ID%") {
      status
    }
  }
`;

const { LAOS_API_KEY } = process.env;
if (!LAOS_API_KEY) throw new Error('Please set LAOS_API_KEY in your .env file.');

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': `${LAOS_API_KEY}`,
};

async function checkEvolveStatus(trackingId) {
  try {
    let status = 'PENDING';
    while (status === 'PENDING') {
      const statusResponse = await axios.post(
        LAOS_API_ENDPOINT,
        {
          query: evolveResponseQuery.replace('%TRACKING_ID%', trackingId),
        },
        { headers },
      );

      if (statusResponse.data.errors) {
        console.error('Error:', statusResponse.data.errors);
        return;
      }

      status = statusResponse.data.data.evolveResponse.status;
      console.log(`Evolving status: ${status}`);

      if (status === 'PENDING') {
        console.log('Checking again in 3 seconds...');
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } else {
        return;
      }
    }
  } catch (error) {
    console.error('Error checking evolve status:', error);
  }
}

async function evolveNFT() {
  try {
    console.log('API request sent. Transaction is being submitted to LAOS...');
    const response = await axios.post(
      LAOS_API_ENDPOINT,
      { query: evolveAsyncMutation },
      { headers },
    );

    if (response.data.errors) {
      console.error('Error:', response.data.errors);
      return;
    }

    const evolveData = response.data.data.evolveAsync;
    if (!evolveData.trackingId) {
      console.log('Failed to get trackingId');
      return;
    }

    console.log('Transaction sent. Transaction hash assigned. Use this Tracking ID to query about its status:', evolveData.trackingId);
    await checkEvolveStatus(evolveData.trackingId);
  } catch (error) {
    console.error('Error making API request:', error);
  }
}

evolveNFT();
