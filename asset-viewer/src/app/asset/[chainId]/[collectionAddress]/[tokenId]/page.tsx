"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import client from "@/lib/apolloClient";
import getNFTDetailsQuery from "@/queries/getNFTDetails";
import NFTDetailsRenderer from "@/components/NFTDetailsRenderer";
import SUPPORTED_CHAINS from "@/constants/supportedChains";

export default function NFTPage() {
  const params = useParams();
  const [nftDetails, setNftDetails] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTDetails = async () => {
      try {
        const chainName = SUPPORTED_CHAINS[params.chainId as string];
        if (!chainName) {
          setErrorMessage(
            `Unsupported chain ID: ${params.chainId}. Supported chains are: ${Object.keys(SUPPORTED_CHAINS).join(
              ", "
            )}`
          );
          return;
        }

        const QUERY = getNFTDetailsQuery(chainName);

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
    return <p>{errorMessage}</p>;
  }

  if (!nftDetails) return <p>Loading NFT details...</p>;

  return <NFTDetailsRenderer nftDetails={nftDetails} />;
}