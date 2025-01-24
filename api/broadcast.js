require('dotenv').config();
const axios = require('axios');

// Specifify the chainID where the uERC721 is deployed, and its contractAddress:
const chainId = 137;
const contractAddress = '0x1b37032445e9bc6b13669357a0a44490e8052c9f';

// Specify the LAOS endpoint (choose between testnet or mainnet)
const LAOS_API_ENDPOINT = 'https://testnet.api.laosnetwork.io/graphql';

const broadcastMutation = `
  mutation BroadcastBatch {
    broadcastBatch(
      input: {
        chainId: "${chainId}"
        ownershipContractAddress: "${contractAddress}"
        tokenIds: [
          "83834123087411776487146708352711876309124697616080602758242164335421823290997",
          "95908609784828203441863748079688753062533515066747621617011273368585779711605"
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
