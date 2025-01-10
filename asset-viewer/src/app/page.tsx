"use client";

import React, { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import client from "@/lib/apolloClient";

type NFTDetails = {
  attributes?: string[]; // Adjust to match the API response structure
  contractName: string;
  contractSymbol: string;
  createdAt: string;
  description: string;
  image: string;
  initialOwner: string;
  name: string;
  owner: string;
  tokenUri: string;
};

export default function HomePage() {
  const [nftDetails, setNftDetails] = useState<NFTDetails | null>(null);

  useEffect(() => {
    const fetchNFTDetails = async () => {
      try {
        const { data } = await client.query({
          query: gql`
            query GetNFTDetails {
              polygon {
                  token(contractAddress: "0x69ba6320041d7a8eeeeb18054d85e8ff1726bf04", tokenId: "2117177865313235697172373569158509151370659628068") {
                  attributes
                  contractName
                  contractSymbol
                  createdAt
                  description
                  image
                  initialOwner
                  name
                  owner
                  tokenUri
                }
              }
            }
          `,
        });

        setNftDetails(data.polygon.token);
      } catch (error) {
        console.error("Error fetching NFT details:", error);
      }
    };

    fetchNFTDetails();
  }, []);

  if (!nftDetails) return <p>Loading NFT details...</p>;

  return (
    <div>
      <h1>{nftDetails.name}</h1>
      <p>{nftDetails.description}</p>
      <img src={nftDetails.image} alt={nftDetails.name} />
      <ul>
        {Array.isArray(nftDetails.attributes) && 
          nftDetails.attributes.map((attr, index) => (
            <li key={index}>{attr}</li>
          ))}
      </ul>
    </div>
  );
}
