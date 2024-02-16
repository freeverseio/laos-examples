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

To send write transactions to the LAOS network, the sender needs to own a minimal amount of funds. Please use [this faucet](https://apps.klaos.io/faucet) if needed.

## Set up the `.env` file

Rename the `example.env` file to `.env`, and fill in the three fields:
* The private key field must start with '0x...', and the corresponding account must have acquired tokens from the faucet. This is field is required.
* The examples use [Pinata](https://www.pinata.cloud/) to upload and store data in IPFS. To use the `ipfs-uploader.js` example, you will need to create a free Pinata account and create a new API key. Paste the key and secret in the fields in the .env file. If you are minting using IPFS addresses from different source, you need not fill in these fields.

## Run the scripts

Each script contains comments in its code that should make it understandable. Modify the required values to adapt to your needs (e.g. contract addresses, recipient of mints, etc.).  

Run the scripts via:

```bash
node script_name.js
```

## Minting an asset on Ethereum or Polygon

The fastest way to mint an asset on Ethereum or Polygon (without paying any ETH or MATIC) is to use pre-created public collections on LAOS. The steps are as follows:

1. Place an image that you would like to be associated with the asset in the 'imgs' folder.
2. Edit the `main()` function of the `ipfs-uploader.js` script to change the path to the image; as well as the title, description, and associated metadata of the asset. Run the script.
3. Paste the ipfs://... output from `ipfs-uploader.js` into the `tokenURI` variable of the `single-mint.js` script.
4. Ensure that the `contractAddress` and `toAddress` variables are set to your requirements, as explained in the script comments. Run the script.
5. The output of the script is a tokenID.

For assets minted in the **Ethereum** public contract, the asset can be viewed at:
`https://apps.klaos.io/asset/1/0x56d77B72C8A7322D2F63bBd17EacB5AeB8671925/<tokenID>`

For assets minted in the **Polygon** public contract, the asset can be viewed at:
`https://apps.klaos.io/asset/137/0x30ebd8d3e9b5b303d2b0a81c5cc0ce90ff185e9c/<tokenID`