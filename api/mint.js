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

const mintMutation = `
  mutation MintNFT {
    mint(
      input: {
        chainId: "${chainId}"
        contractAddress: "${contractAddress}"
        tokens: [
          {
            mintTo: ["0x4E6Da57f62b9954fBb6bAb531F556BE08E128e75"],
            name: "First NFT",
            description: "First NFT Description",
            attributes: [{ trait_type: "Category", value: "Example" }],
            image: "ipfs://HASH_1"
          },
          {
            mintTo: ["0x4E6Da57f62b9954fBb6bAb531F556BE08E128e75"],
            name: "Second NFT",
            description: "Second NFT Description",
            attributes: [{ trait_type: "Category", value: "Example" }],
            image: "ipfs://HASH_2"
          }
        ]
      }
    ) {
      tokenIds
      success
    }
  }
`;

async function mintNFT() {
  try {
    console.log('API request sent. Please wait until the mint transaction is confirmed on LAOS...');
    const response = await axios.post(
      LAOS_API_ENDPOINT,
      { query: mintMutation },
      { headers },
    );

    console.log(response);
    if (response.data.errors) {
      console.error('Error setting up collection:', response.data.errors);
      return;
    }

    const mintData = response.data.data.mint;
    console.log('Mint successful. New NFTs minted with these tokenIDs:');
    console.log(mintData.tokenIds);
    console.log(`They can be traded directly on chaind ${chainId}, contract ${contractAddress}`);
  } catch (error) {
    console.error('Error making API request:', error);
  }
}

mintNFT();
