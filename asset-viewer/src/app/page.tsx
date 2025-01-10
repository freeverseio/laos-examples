"use client";

import React, { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import client from "@/lib/apolloClient";

type NFTDetails = {
  attributes: string[];
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

export default function Home() {
  const [nftDetails, setNftDetails] = useState<NFTDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTDetails = async () => {
      try {
        const { data } = await client.query({
          query: gql`
            query MyQuery {
              polygon {
                token(contractAddress: "0x123...", tokenId: "1") {
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
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTDetails();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>{nftDetails?.name}</h1>
      <img src={nftDetails?.image} alt={nftDetails?.name} style={{ maxWidth: "300px" }} />
      <p>{nftDetails?.description}</p>
      <ul>
        {nftDetails?.attributes.map((attr, index) => (
          <li key={index}>{attr}</li>
        ))}
      </ul>
      <p>Contract Name: {nftDetails?.contractName}</p>
      <p>Contract Symbol: {nftDetails?.contractSymbol}</p>
      <p>Created At: {nftDetails?.createdAt}</p>
      <p>Initial Owner: {nftDetails?.initialOwner}</p>
      <p>Owner: {nftDetails?.owner}</p>
      <a href={nftDetails?.tokenUri} target="_blank" rel="noopener noreferrer">
        Token URI
      </a>
    </div>
  );
}