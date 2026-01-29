import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const providers = {
  optimism: new ethers.providers.JsonRpcProvider(process.env.OPTIMISM_RPC_URL),
  "optimism-goerli": new ethers.providers.JsonRpcProvider(
    process.env.OPTIMISM_SEPOLIA_RPC_URL,
  ),
};
try {
  providers["base-sepolia"] = new ethers.providers.JsonRpcProvider(
    process.env.BASE_SEPOLIA_RPC_URL,
  );
} catch (err) {}
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, providers.optimism);
const thisAddress = signer.address;

export { thisAddress, providers };
