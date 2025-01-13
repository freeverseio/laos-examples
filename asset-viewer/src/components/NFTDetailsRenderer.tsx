import React from "react";
import Image from "next/image";
import { NFTDetails } from "@/types/NFTTypes";

interface ImageWithLoadingProps {
  src: string;
  alt: string;
}

const ImageWithLoading: React.FC<ImageWithLoadingProps> = ({ src, alt }) => {
  const [isLoading, setIsLoading] = React.useState(true);

  return (
    <div className="image-container">
      {isLoading && <p className="loading-text">Loading Image...</p>}
      <Image
        src={src}
        alt={alt}
        width={500}
        height={500}
        onLoadingComplete={() => setIsLoading(false)}
        className="nft-image"
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
    <div className="nft-details-container">
      <div className="nft-header">
        {nftDetails?.image && (
          <ImageWithLoading
            src={getImageUrl(nftDetails.image)}
            alt="NFT Image"
          />
        )}
        <div className="nft-header-info">
          <h1 className="nft-name">{nftDetails?.name || "Unnamed Asset"}</h1>
          <div className="nft-meta">
            <p>
              <strong>Collection:</strong>{" "}
              {nftDetails?.contractAddress || "Unknown"}
            </p>
            <p>
              <strong>Blockchain:</strong> Polygon
            </p>
            <p>
              <strong>Owned by:</strong>{" "}
              <span className="owner-text">
                {nftDetails?.owner || "Unknown"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Details and Description Section */}
      <div className="nft-details">
        <div className="details-box">
          <h2>Details</h2>
          <p>
            <strong>Contract Address:</strong>{" "}
            {nftDetails?.laosContract || "Not defined"}
          </p>
          <p>
            <strong>Token ID:</strong>{" "}
            {nftDetails?.tokenId || "Not defined"}
          </p>
          <p>
            <strong>Token Standard:</strong>{" "}
            {nftDetails?.contractSymbol || "Not defined"}
          </p>
        </div>
        <div className="description-box">
          <h2>Description</h2>
          <p>{nftDetails?.description || "No description available"}</p>
        </div>
      </div>

      {/* Attributes Section */}
      <div className="attributes-section">
        <h2>Attributes</h2>
        {nftDetails?.attributes && nftDetails.attributes.length > 0 ? (
          <ul className="attributes-list">
            {nftDetails.attributes.map((attr, index) => (
              <li key={index} className="attribute-item">
                <span className="trait-type">{attr.traitType || "Unknown"}:</span>{" "}
                <span className="value">{attr.value || "Unknown"}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-attributes">No attributes available</p>
        )}
      </div>
    </div>
  );
};

export default NFTDetailsRenderer;
