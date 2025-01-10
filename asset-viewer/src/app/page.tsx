"use client";

import React, { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import client from "@/lib/apolloClient";
import Image from "next/image";

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

function getImageUrl(ipfsUrl: string): string {
  if (ipfsUrl.startsWith("ipfs://")) {
    return ipfsUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return ipfsUrl;
}

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
      <h1>NFT Details</h1>
      <p>Name: {nftDetails?.name || "not defined"}</p>
      <p>Description: {nftDetails?.description || "not defined"}</p>
      <p>Contract Name: {nftDetails?.contractName || "not defined"}</p>
      <p>Contract Symbol: {nftDetails?.contractSymbol || "not defined"}</p>
      <p>Created At: {nftDetails?.createdAt || "not defined"}</p>
      <p>Initial Owner: {nftDetails?.initialOwner || "not defined"}</p>
      <p>Current Owner: {nftDetails?.owner || "not defined"}</p>
      <p>Token URI: {nftDetails?.tokenUri || "not defined"}</p>
      {nftDetails?.image && (
        <Image
          src={getImageUrl(nftDetails.image)}
          alt="NFT Image"
          width={300} // Specify desired width
          height={300} // Specify desired height
          style={{ objectFit: "contain" }}
        />
      )}
      <h3>Attributes:</h3>
      <ul>
        {nftDetails?.attributes?.length > 0 ? (
          nftDetails?.attributes.map((attr, index) => (
            <li key={index}>
              {attr.traitType}: {attr.value}
            </li>
          ))
        ) : (
          <li>Attributes: not defined</li>
        )}
      </ul>
    </div>
  );
}
