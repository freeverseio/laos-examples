"use client";

import React, { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import client from "@/lib/apolloClient";

type Attribute = {
  value: string;
  traitType: string;
};

type NFTDetails = {
  attributes?: Attribute[];
  contractName?: string;
  contractSymbol?: string;
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
                  token(contractAddress: "0x2f40c1f77ea0634ac917dec84b1f81ce15168f60", tokenId: "8497449126796600337638709424460934217958989103543281851987122499457363821940") {
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

        console.log("GraphQL query response:", data);
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
      <h1>{nftDetails?.name}</h1>
      <p>{nftDetails?.description}</p>
      <ul>
        {nftDetails?.attributes.map((attr, index) => (
          <li key={index}>
            {attr.traitType}: {attr.value}
          </li>
        ))}
      </ul>
    </div>
  );
}
