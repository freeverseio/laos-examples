# LAOS Examples

This repository contains simple examples demonstrating how to use LAOS to scale the minting and evolution of assets on any EVM chain.

* The [EVM folder](./evm) contains examples to interact directly with the EVM RPC endpoints of both LAOS and the chosen EVM chain. This approach is fully decentralized and permissionless.
* The [API folder](./api) contains examples that use the API maintained by the LAOS Foundation. This approach simplifies integration and supports development similar to traditional Web2 systems.

For further documentation about LAOS, the following can be of interest:

- [LAOS Documentation](https://docs.laosnetwork.io/)
- [LAOS Main GitHub](https://github.com/freeverseio/laos)
- [LAOS Landing Page](https://laosnetwork.io)
- [Further Resources](https://docs.laosnetwork.io/introduction/resources)

## Getting Started

To get started, either use:
* LAOS Mainnet, with public RPC node at https://rpc.laos.laosfoundation.io
* LAOS Sigma Testnet, with public RPC node at https://rpc.laossigma.laosfoundation.io

If using the testnet, please use [this faucet](https://testnet.apps.laosnetwork.io/faucet) to obtain testnet tokens if needed.

## Set up the `.env` file

Rename the `example.env` file to `.env`, and fill in the three fields:
* The private key field must start with `0x...`, and the corresponding account must have tokens of the corresponding network. This field is required.
* The `ipfs-uploader.js` example uses [Pinata](https://www.pinata.cloud/) to upload and store data in IPFS. Either use your Pinata API key or create a free Pinata account to get one. Paste the key and secret in the fields in the .env file. If you are minting using IPFS addresses from a different source, you need not fill in these fields.

## Install

To run the node.js examples, first install dependencies via:

```bash
npm ci
```

## Run the scripts

Each script contains comments in its code that should make it understandable. Modify the required values to adapt to your needs (e.g. contract addresses, recipient of mints, etc.).  

Run the scripts via:

```bash
node evm/script_name.js
node api/script_name.js
```

Supported scripts:

```bash
# Deploys properly configured contracts on LAOS and an EVM chain of choice
# to enable scaling via Bridgeless Minting:
node evm/setup-bridgeless-minting.js
node api/setup-bridgeless-minting.js

# Creates a sibling collection on the LAOS Network. This is the 1st step used by 'setup-bridgeless-minting'.
node evm/create-laos-collection.js

# Deploys a uERC721 contract on the chosen EVM chain. This is the 2nd step used by 'setup-bridgeless-minting'.
node evm/deploy721.js

# Mints a single asset to an existing sibling collection on the LAOS Network.
node evm/mint.js
node api/mint.js

# Mints a large number of assets in batches, efficiently filling each block to maximize throughput.
node evm/mint-in-batches.js

# Evolves an asset previously minted on a sibling collection.
node evm/evolve.js
node api/evolve.js

# Demonstrates how to upload asset metadata to IPFS.
node evm/ipfs-uploader.js

#  Emits a transfer event on the EVM chain to notify marketplaces that do not yet natively integrate with LAOS.
node evm/broadcast.js
node api/broadcast.js

# Extends the metadata of any asset on any EVM chain in a permissionless manner.
node evm/asset-metadata-extender.js
```

## Brief tutorial: minting an Asset on Ethereum or Polygon via direct RPC-EVM interaction

The fastest way to bridgelessly mint an asset on Ethereum or Polygon (without paying any ETH or MATIC) is to use existing collections that have Public Minting enabled. 

The steps are as follows:

1. Place an image that you would like to be associated with the asset in the `./imgs` folder.
2. Edit the `main()` function of the `ipfs-uploader.js` script to use the path to the image, as well as the title, description, and associated metadata of the asset. Run the script.
3. Paste the resulting `ipfs://...` output from `ipfs-uploader.js` into the `tokenURI` variable of the `mint.js` script.
4. Ensure that the `laosCollectionAddr` and `recipient` variables are set to your requirements, as explained in the script comments. Run the script.
5. The output of the script is a `tokenID`.

If you used the suggested public collections in the example, the minted assets can be viewed at:

* For assets minted on the [Ethereum Public collection](https://testnet.apps.laosnetwork.io/collection/1/0xee5B64092Fb09a219baa4D0DF909ED730A85c67e):
`https://testnet.apps.laosnetwork.io/asset/1/0xee5b64092fb09a219baa4d0df909ed730a85c67e/<tokenID>`

* For assets minted on the [Polygon Public collection](https://testnet.apps.laosnetwork.io/collection/137/0x0Cf5Fc5b64d60c13894328b16042a4D8F8398EbF):
`https://testnet.apps.laosnetwork.io/collection/137/0x30ebd8d3e9b5b303d2b0a81c5cc0ce90ff185e9c/<tokenID>`
