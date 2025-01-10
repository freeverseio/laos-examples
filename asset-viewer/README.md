# Minimalistic Asset Viewer using the LAOS API

This example demonstrates a minimalistic Next.js App to display NFT details at the following URL:
```
http://localhost:3000/asset/[chainId]/[contractAddress]/[tokenId]
```
The data is fetched from the [LAOS public API](https://docs.laosnetwork.io/laos-api/introduction).

While the API provides a simplified way to access NFT details,
this information can also be retrieved directly from the LAOS blockchain by connecting to a [public node](https://docs.laosnetwork.io/introduction/laos-and-its-testnet)
or [nunning your own node](https://docs.laosnetwork.io/the-laos-node/the-layer-1-node).

## Getting Started

Install and run the development server:

```bash
npm ci
npm run dev
```

Check your browser, by going, for example, to:

http://localhost:3000/asset/137/0x2f40c1f77ea0634ac917dec84b1f81ce15168f60/8497449126796600337638709424460934217958989103543281851987122499457363821940



## Deploy on Vercel

The easiest way to deploy an Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
