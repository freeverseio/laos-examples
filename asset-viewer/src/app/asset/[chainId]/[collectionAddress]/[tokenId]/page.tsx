"use client";

import React, { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import client from "@/lib/apolloClient";
import Image from "next/image";
import { useParams } from "next/navigation";

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

const SUPPORTED_CHAINS: Record<string, string> = {
  "1": "ethereum",
  "137": "polygon",
  "296": "hederatestnet",
};

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

export default function NFTPage() {
  const params = useParams();
  const [nftDetails, setNftDetails] = useState<NFTDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTDetails = async () => {
      try {
        const chainName = SUPPORTED_CHAINS[params.chainId];
        if (!chainName) {
          setErrorMessage(
            `Unsupported chain ID: ${params.chainId}. Supported chains are: ${Object.keys(SUPPORTED_CHAINS).join(
              ", "
            )}`
          );
          return;
        }
    
        const QUERY = gql`
          query GetNFTDetails($collectionAddress: String!, $tokenId: String!) {
            ${chainName} {
              token(contractAddress: $collectionAddress, tokenId: $tokenId) {
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
        `;
    
        const { data } = await client.query({
          query: QUERY,
          variables: {
            collectionAddress: params.collectionAddress,
            tokenId: params.tokenId,
          },
        });
    
        if (!data[chainName]?.token) {
          setErrorMessage(
            `Token not found. Please verify the contract address (${params.collectionAddress}) and token ID (${params.tokenId}).`
          );
          return;
        }
        setNftDetails(data[chainName]?.token);
      } catch (error) {
        console.error("Error fetching NFT details:", error);
      }
    };

    fetchNFTDetails();
  }, [params]);

  if (errorMessage) {
    return (
        <p>{errorMessage}</p>
    );
  }
  
  if (!nftDetails) return <p>Loading NFT details...</p>;

  return (
    <div>
      <p>
        <span style={{ color: "lime" }}>TokenId:</span> {nftDetails?.tokenId || "not defined"}
      </p>
      <p>
        <span style={{ color: "lime" }}>Name:</span> {nftDetails?.name || "not defined"}
      </p>
      <p>
        <span style={{ color: "lime" }}>Description:</span> {nftDetails?.description || "not defined"}
      </p>
      <p>
        <span style={{ color: "lime" }}>Contract Name:</span> {nftDetails?.contractName || "not defined"}
      </p>
      <p>
        <span style={{ color: "lime" }}>Contract Symbol:</span> {nftDetails?.contractSymbol || "not defined"}
      </p>
      <p>
        <span style={{ color: "lime" }}>Created At:</span> {nftDetails?.createdAt || "not defined"}
      </p>
      <p>
        <span style={{ color: "lime" }}>Initial Owner:</span> {nftDetails?.initialOwner || "not defined"}
      </p>
      <p>
        <span style={{ color: "lime" }}>Current Owner:</span> {nftDetails?.owner || "not defined"}
      </p>
      <p>
        <span style={{ color: "lime" }}>Token URI:</span> {nftDetails?.tokenUri || "not defined"}
      </p>
      {nftDetails?.image && (
        <ImageWithLoading
          src={getImageUrl(nftDetails.image)}
          alt="NFT Image"
        />
      )}
      <p>
        <span style={{ color: "lime" }}>Attributes:</span>
      </p>
      <ul>
        {nftDetails?.attributes && nftDetails.attributes.length > 0 ? (
          nftDetails.attributes.map((attr, index) => (
            <li key={index}>
              <span style={{ color: "lime" }}>{attr.traitType || "Unknown"}:</span> {attr.value || "Unknown"}
            </li>
          ))
        ) : (
          <li>Attributes: not defined</li>
        )}
      </ul>
    </div>
  );
}
