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
    <div className="image-wrapper">
      {isLoading && <p className="highlight">Loading Image...</p>}
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
    <div className="asset-viewer">
      <p>
        <span className="brandColor">TokenId:</span>{" "}
        <span className="text-white">{nftDetails?.tokenId || "Not defined"}</span>
      </p>
      <p>
        <span className="brandColor">Name:</span>{" "}
        <span className="text-white">{nftDetails?.name || "Not defined"}</span>
      </p>
      <p>
        <span className="brandColor">Description:</span>{" "}
        <span className="text-white">{nftDetails?.description || "Not defined"}</span>
      </p>
      <p>
        <span className="brandColor">Contract Name:</span>{" "}
        <span className="text-white">{nftDetails?.contractName || "Not defined"}</span>
      </p>
      <p>
        <span className="brandColor">Contract Symbol:</span>{" "}
        <span className="text-white">{nftDetails?.contractSymbol || "Not defined"}</span>
      </p>
      <p>
        <span className="brandColor">LAOS Sibling Collection:</span>{" "}
        <span className="text-white">{nftDetails?.laosContract || "Not defined"}</span>
      </p>
      <p>
        <span className="brandColor">Created At:</span>{" "}
        <span className="text-white">{nftDetails?.createdAt || "Not defined"}</span>
      </p>
      <p>
        <span className="brandColor">Initial Owner:</span>{" "}
        <span className="text-white">{nftDetails?.initialOwner || "Not defined"}</span>
      </p>
      <p>
        <span className="brandColor">Current Owner:</span>{" "}
        <span className="text-white">{nftDetails?.owner || "Not defined"}</span>
      </p>
      <p>
        <span className="brandColor">Token URI:</span>{" "}
        <span className="text-white">{nftDetails?.tokenUri || "Not defined"}</span>
      </p>
      <p>
        <span className="brandColor">Attributes:</span>
      </p>
      <ul>
        {nftDetails?.attributes && nftDetails.attributes.length > 0 ? (
          nftDetails.attributes.map((attr, index) => (
            <li key={index}>
              <span className="highlight">{attr.traitType || "Unknown"}:</span>{" "}
              <span className="text-white">{attr.value || "Unknown"}</span>
            </li>
          ))
        ) : (
          <li className="text-white">Attributes: Not defined</li>
        )}
      </ul>
      {nftDetails?.image && (
        <ImageWithLoading
          src={getImageUrl(nftDetails.image)}
          alt="NFT Image"
        />
      )}
    </div>
  );
};

export default NFTDetailsRenderer;
