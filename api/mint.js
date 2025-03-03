require('dotenv').config();
const axios = require('axios');

// Specify the chainID where the uERC721 is deployed, and its contractAddress:
const chainId = 137;
const contractAddress = '0xc3804be6b4a46a3bacf80a1578627cbd780da765';

const LAOS_API_ENDPOINT = 'https://api.laosnetwork.io/v2/graphql';

const mintMutation = `
  mutation MintNFT {
    mint(
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

async function mintNFT() {
  try {
    console.log('API request sent. Please wait until the mint transaction is confirmed on LAOS...');
    const response = await axios.post(
      LAOS_API_ENDPOINT,
      { query: mintMutation },
      { headers },
    );

    if (response.data.errors) {
      console.error('Error:', response.data.errors);
      return;
    }

    const mintData = response.data.data.mint;
    if (!mintData.success) {
      console.log('Transaction failed');
      return;
    }
    console.log('Mint successful. New NFTs minted with these tokenIDs:');
    console.log(mintData.tokenIds);
    console.log(`They can be traded directly on chaind ${chainId}, contract ${contractAddress}`);
  } catch (error) {
    console.error('Error making API request:', error);
  }
}

mintNFT();
