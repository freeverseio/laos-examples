require('dotenv').config();
const axios = require('axios');

// Specify the chainID where the uERC721 is deployed, and its contractAddress:
const chainId = 137;
const contractAddress = '0x9f16fc5a49afa724407225e97edb8775fe4eb9fb';

const LAOS_API_ENDPOINT = 'https://api.laosnetwork.io/v2/graphql';

const broadcastMutation = `
  mutation Broadcast {
    broadcast(
      input: {
        chainId: "${chainId}"
        ownershipContractAddress: "${contractAddress}"
        tokenIds: [
          "66411355714187073314704920013201981051255304368864801044887078638344704552966",
          "74995149788672080040352642669527055209321302525004511819743852700164378783750"
        ]
        type: "SELF"
      }
    ) {
      tokenIds
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

async function broadcastNFT() {
  try {
    console.log(`API request sent. Please wait until the broadcast transaction is confirmed on chain ${chainId}...`);
    const response = await axios.post(
      LAOS_API_ENDPOINT,
      { query: broadcastMutation },
      { headers },
    );

    if (response.data.errors) {
      console.error('Error:', response.data.errors);
      return;
    }

    const broadcastData = response.data.data.broadcastBatch;
    if (!broadcastData.success) {
      console.log('Transaction failed');
      return;
    }
    console.log('The following NFTs were broadcast:');
    console.log(broadcastData.tokenIds);
  } catch (error) {
    console.error('Error making API request:', error);
  }
}

broadcastNFT();
