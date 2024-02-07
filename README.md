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

Follow the `example.env` file to create your own `.env` file. Make sure the private key corresponds to an account with enough funds.

## Run the scripts

Each script contains comments in its code that should make it understandable. Modify the required values to adapt to your needs (e.g. contract addresses, recipient of mints, etc.).  

Run the scripts via:

```bash
node script_name.js
```