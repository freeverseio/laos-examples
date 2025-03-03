require('dotenv').config();
const axios = require('axios');

// Specify the chainID where the uERC721 is deployed, and its contractAddress:
const chainId = 137;
const contractAddress = '0x1b37032445e9bc6b13669357a0a44490e8052c9f';

const LAOS_API_ENDPOINT = 'https://api.laosnetwork.io/v2/graphql';

const mintAsyncMutation = `
  mutation MintNFT {
    mintAsync(
      input: {
        chainId: "${chainId}"
        contractAddress: "${contractAddress}"
        tokens: [
          {
            mintTo: "0x4E6Da57f62b9954fBb6bAb531F556BE08E128e75",
            name: "First NFT",
            description: "First NFT Description",
            attributes: [{ trait_type: "Category", value: "Example" }],
            image: "ipfs://HASH_1"
          },
          {
            mintTo: "0x4E6Da57f62b9954fBb6bAb531F556BE08E128e75",
            name: "Second NFT",
            description: "Second NFT Description",
            attributes: [{ trait_type: "Category", value: "Example" }],
            image: "ipfs://HASH_2"
          }
        ]
      }
    ) {
      tokenIds
      status
      trackingId
    }
  }
`;

const mintResponseQuery = `
  query mintNFTResponse {
    mintResponse(trackingId: "%TRACKING_ID%") {
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

async function mintNFT() {
  try {
    console.log('API request sent. Please wait until the mint transaction is confirmed on LAOS...');
    const response = await axios.post(
      LAOS_API_ENDPOINT,
      { query: mintAsyncMutation },
      { headers }
    );

    if (response.data.errors) {
      console.error('Error:', response.data.errors);
      return;
    }

    const mintData = response.data.data.mintAsync;
    if (!mintData.trackingId) {
      console.log('Failed to get trackingId');
      return;
    }

    console.log('Minting started. Tracking ID:', mintData.trackingId);
    await checkMintStatus(mintData.trackingId);

  } catch (error) {
    console.error('Error making API request:', error);
  }
}

async function checkMintStatus(trackingId) {
  try {
    let status = 'PENDING';
    while (status === 'PENDING') {
      const statusResponse = await axios.post(
        LAOS_API_ENDPOINT,
        {
          query: mintResponseQuery.replace('%TRACKING_ID%', trackingId)
        },
        { headers }
      );

      if (statusResponse.data.errors) {
        console.error('Error:', statusResponse.data.errors);
        return;
      }

      status = statusResponse.data.data.mintResponse.status;
      console.log(`Minting status: ${status}`);

      if (status === 'PENDING') {
        console.log('Checking again in 3 seconds...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        return;
      }
    }
  } catch (error) {
    console.error('Error checking mint status:', error);
  }
}

mintNFT();
