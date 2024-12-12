# LAOS Examples

This repository contains simple examples demonstrating how to interact with the LAOS blockchain. For further documentation about LAOS, the following can be of interest:

- [LAOS Documentation](https://docs.laosnetwork.io/)
- [LAOS Main GitHub](https://github.com/freeverseio/laos)
- [LAOS Landing Page](https://laosnetwork.io)
- [Further Resources](https://docs.laosnetwork.io/introduction/resources)

## Install

To run the node.js examples, first install dependencies via:

```bash
npm ci
```

## Obtain tokens from the faucet

To get started, either use:
* LAOS Mainnet, with public RPC node at https://rpc.laos.laosfoundation.io
* LAOS Sigma Testnet, with public RPC node at https://rpc.laossigma.laosfoundation.io'

If using the testnet, please use [this faucet](https://testnet.apps.laosnetwork.io/faucet) to obtain testnet tokens if needed.

## Set up the `.env` file

Rename the `example.env` file to `.env`, and fill in the three fields:
* The private key field must start with `0x...`, and the corresponding account must have tokens of the corresponding network. This field is required.
* The `ipfs-uploader.js` example uses [Pinata](https://www.pinata.cloud/) to upload and store data in IPFS. Either use your Pinata API key or create a free Pinata account to get one. Paste the key and secret in the fields in the .env file. If you are minting using IPFS addresses from a different source, you need not fill in these fields.

## Run the scripts

Each script contains comments in its code that should make it understandable. Modify the required values to adapt to your needs (e.g. contract addresses, recipient of mints, etc.).  

Run the scripts via:

```bash
node script_name.js
```

A typical minimal path to get onboarded would be:

```bash
# create a collection
node create-laos-collection.js

# copy-paste the generated LAOS collection address in the mint.js script, then:
node mint.js

# copy-paste the generated Token ID, and the LAOS collection address, in the evolve.js script, then:
node evolve.js
```

## Minting an asset on Ethereum or Polygon

The fastest way to bridgelessly mint an asset on Ethereum or Polygon (without paying any ETH or MATIC) is to use existing collections that have Public Minting enabled. 

The steps are as follows:

1. Place an image that you would like to be associated with the asset in the `./imgs` folder.
2. Edit the `main()` function of the `ipfs-uploader.js` script to use the path to the image, as well as the title, description, and associated metadata of the asset. Run the script.
3. Paste the resulting `ipfs://...` output from `ipfs-uploader.js` into the `tokenURI` variable of the `mint.js` script.
4. Ensure that the `laosCollectionAddr` and `toAddress` variables are set to your requirements, as explained in the script comments. Run the script.
5. The output of the script is a `tokenID`.

If you used the suggested public collections in the example, the minted assets can be viewed at:

* For assets minted in the [Ethereum public collection](https://testnet.apps.laosnetwork.io/collection/1/0xee5B64092Fb09a219baa4D0DF909ED730A85c67e):
`https://testnet.apps.laosnetwork.io/asset/1/0xee5b64092fb09a219baa4d0df909ed730a85c67e/<tokenID>`

* For assets minted in the [Polygon public collection](https://testnet.apps.laosnetwork.io/collection/137/0x0Cf5Fc5b64d60c13894328b16042a4D8F8398EbF):
`https://testnet.apps.laosnetwork.io/collection/137/0x30ebd8d3e9b5b303d2b0a81c5cc0ce90ff185e9c/<tokenID>`
