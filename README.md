## Solo Sending

This app allows users to transfer ETH or any ERC20 token on Sepolia between wallet addresses.

## Live Link

https://solo-sending.netlify.app

## Features

-   Send both ETH or ERC20 tokens
-   Use EIP-1559 model
-   Set custom gas fee
-   Validates supplied MaxFeePerGas to match with current network's baseFee.
-   Estimate transaction execution time based on gas fee levels
-   Fetch up to date network gas prices based on different execution speeds
-   Speed up stuck/pending tranactions
-   Transaction successful notification
-   Transaction history with transaction receipt details

## Implementation notes

This project has been implemented using

-   Nextjs 14 (app router)
-   Wagmi/Viem & Ethers V6
-   Redux/Redux persist
-   SCSS
-   Typescript

I have abstracted all the core blockchain interaction logic into the web3Utils.ts > ContractUtils class. This is to ensure a robust and scalable implementation strategy. For instance, we can easily switch between using wagmi actions and ethers v6 by modifying the methpd definitions in the class whereas the rest of the application remains unchanged.

I have also deployed an ERC20 token $SOLO to help test out the application. You can request for some test SOLO tokens.

## How to run

```bash
git clone <repository_url>
cd folder_name

yarn #or npm install
yarn dev # or npm run dev
```
