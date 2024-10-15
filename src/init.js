import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const providers = {
  optimism: new ethers.providers.AlchemyProvider(
    "optimism",
    process.env.ALCHEMY_APIKEY
  ),
  "optimism-goerli": new ethers.providers.AlchemyProvider(
    "optimism-goerli",
    process.env.ALCHEMY_APIKEY
  ),
};
try {
  providers["base-sepolia"] = new ethers.providers.JsonRpcProvider(
    process.env.BASE_SEPOLIA_RPC_URL
  );
} catch (err) {}
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, providers.optimism);
const thisAddress = signer.address;

export { thisAddress, providers };
