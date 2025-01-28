import { gql } from "@apollo/client";

const getNFTDetailsQuery = (chainName: string) => gql`
  query GetNFTDetails($collectionAddress: String!, $tokenId: String!) {
    ${chainName} {
      token(contractAddress: $collectionAddress, tokenId: $tokenId) {
        attributes
        contractName
        contractSymbol
        contractAddress
        createdAt
        description
        image
        initialOwner
        name
        owner
        tokenUri
        tokenId
        laosContract
      }
    }
  }
`;

export default getNFTDetailsQuery;