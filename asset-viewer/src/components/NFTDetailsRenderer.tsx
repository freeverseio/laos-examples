import React from "react";
import Image from "next/image";

interface Attribute {
  value: string;
  traitType: string;
}

interface NFTDetails {
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
  laosContract?: string;
}

interface ImageWithLoadingProps {
  src: string;
  alt: string;
}

const ImageWithLoading: React.FC<ImageWithLoadingProps> = ({ src, alt }) => {
  const [isLoading, setIsLoading] = React.useState(true);

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

function getImageUrl(ipfsUrl: string): string {
  if (ipfsUrl.startsWith("ipfs://")) {
    return ipfsUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return ipfsUrl;
}

interface NFTDetailsRendererProps {
  nftDetails: NFTDetails;
}

const NFTDetailsRenderer: React.FC<NFTDetailsRendererProps> = ({ nftDetails }) => {
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
        <span style={{ color: "lime" }}>LAOS Sibling Collection:</span> {nftDetails?.laosContract || "not defined"}
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
              {attr.traitType || "Unknown"}: {attr.value || "Unknown"}
            </li>
          ))
        ) : (
          <li>Attributes: not defined</li>
        )}
      </ul>
    </div>
  );
};

export default NFTDetailsRenderer;
