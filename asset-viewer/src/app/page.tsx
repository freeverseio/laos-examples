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
  createdAt?: string;
  description?: string;
  image?: string;
  initialOwner?: string;
  name?: string;
  owner?: string;
  tokenUri?: string;
  tokenId?: string;
};

interface ImageWithLoadingProps {
  src: string;
  alt: string;
}

function getImageUrl(ipfsUrl: string): string {
  if (ipfsUrl.startsWith("ipfs://")) {
    return ipfsUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return ipfsUrl;
}

const ImageWithLoading: React.FC<ImageWithLoadingProps> = ({ src, alt }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div style={{ position: "relative", width: "100%", height: "auto" }}>
      {isLoading && <p>Loading Image...</p>}
      <Image
        src={src}
        alt={alt}
        width={500}
        height={500}
        onLoadingComplete={() => setIsLoading(false)}
      />
    </div>
  );
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
                token(
                  contractAddress: "0x2f40c1f77ea0634ac917dec84b1f81ce15168f60"
                  tokenId: "8497449126796600337638709424460934217958989103543281851987122499457363821940"
                ) {
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
                  tokenId
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
      <h1>NFT Viewer</h1>
      <p>TokenId: {nftDetails?.tokenId || "not defined"}</p>
      <p>Name: {nftDetails?.name || "not defined"}</p>
      <p>Description: {nftDetails?.description || "not defined"}</p>
      <p>Contract Name: {nftDetails?.contractName || "not defined"}</p>
      <p>Contract Symbol: {nftDetails?.contractSymbol || "not defined"}</p>
      <p>Created At: {nftDetails?.createdAt || "not defined"}</p>
      <p>Initial Owner: {nftDetails?.initialOwner || "not defined"}</p>
      <p>Current Owner: {nftDetails?.owner || "not defined"}</p>
      <p>Token URI: {nftDetails?.tokenUri || "not defined"}</p>
      {nftDetails?.image && (
        <ImageWithLoading
          src={getImageUrl(nftDetails.image)}
          alt="NFT Image"
        />
      )}
      <h3>Attributes:</h3>
      <ul>
        {nftDetails?.attributes && nftDetails.attributes.length > 0 ? (
          nftDetails.attributes.map((attr, index) => (
            <li key={index}>
              {attr.traitType || "Unknown"}: {attr.value || "Unknown"}
            </li>
          ))
        ) : (
          <li>Attributes: not defined</li>
        )}
      </ul>
    </div>
  );
}
