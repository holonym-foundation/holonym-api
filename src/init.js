import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

// TODO: Update provider--use multiple providers maybe--when contracts are deployed to mainnet
const provider = new ethers.providers.AlchemyProvider(
  "optimism-goerli",
  process.env.ALCHEMY_APIKEY
);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const thisAddress = signer.address;

export { thisAddress, provider };
