"use client";

import React, { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import client from "@/lib/apolloClient";
import Image from "next/image";
import { NFTDetails } from "@/types/NFTTypes";


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

export default function NFTPage({
  params,
}: {
  params: { chainId: string; collectionAddress: string; tokenId: string };
}) {
  const [nftDetails, setNftDetails] = useState<NFTDetails | null>(null);

  useEffect(() => {
    const fetchNFTDetails = async () => {
      try {
        const { data } = await client.query({
          query: gql`
            query GetNFTDetails(
              $collectionAddress: String!
              $tokenId: String!
            ) {
              polygon {
                token(
                  contractAddress: $collectionAddress
                  tokenId: $tokenId
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
          variables: {
            collectionAddress: params.collectionAddress,
            tokenId: params.tokenId,
          },
        });

        console.log("GraphQL query response:", data);
        setNftDetails(data.polygon.token);
      } catch (error) {
        console.error("Error fetching NFT details:", error);
      }
    };

    fetchNFTDetails();
  }, [params]);

  if (!nftDetails) return <p>Loading NFT details...</p>;

  return (
    <div>
      <h1>NFT Viewer</h1>
      <p style={{ color: "lime" }}>TokenId: {nftDetails?.tokenId || "not defined"}</p>
      <p style={{ color: "lime" }}>Name: {nftDetails?.name || "not defined"}</p>
      <p style={{ color: "lime" }}>Description: {nftDetails?.description || "not defined"}</p>
      <p style={{ color: "lime" }}>Contract Name: {nftDetails?.contractName || "not defined"}</p>
      <p style={{ color: "lime" }}>Contract Symbol: {nftDetails?.contractSymbol || "not defined"}</p>
      <p style={{ color: "lime" }}>Created At: {nftDetails?.createdAt || "not defined"}</p>
      <p style={{ color: "lime" }}>Initial Owner: {nftDetails?.initialOwner || "not defined"}</p>
      <p style={{ color: "lime" }}>Current Owner: {nftDetails?.owner || "not defined"}</p>
      <p style={{ color: "lime" }}>Token URI: {nftDetails?.tokenUri || "not defined"}</p>
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
