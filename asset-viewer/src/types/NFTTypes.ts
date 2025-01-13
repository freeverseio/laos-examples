export type Attribute = {
  value: string;
  traitType: string;
};

export type NFTDetails = {
  attributes?: Attribute[];
  collectionContract?: string;
  contractName?: string;
  contractSymbol?: string;
  contractAddress?: string;
  createdAt?: string;
  description?: string;
  image?: string;
  initialOwner?: string;
  name?: string;
  owner?: string;
  tokenUri?: string;
  tokenId?: string;
  laosContract?: string;
};