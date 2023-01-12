import { ethers } from "ethers";
import dotenv from "dotenv";
import { treeAddrsByNetwork } from "./src/constants/contractAddresses.js";
dotenv.config();

const providers = {
  optimism: new ethers.providers.AlchemyProvider(
    "optimism",
    process.env.ALCHEMY_APIKEY
  ),
  // "optimism-goerli": new ethers.providers.AlchemyProvider(
  //   "optimism-goerli",
  //   process.env.ALCHEMY_APIKEY
  // ),
};
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, providers.optimism);
const thisAddress = signer.address;

// const userAddr = "0xdbd6b2c02338919EdAa192F5b60F5e5840A50079";
// const userAddrAsUint = ethers.BigNumber.from(userAddr).toString();
// console.log("userAddr", userAddr);
// console.log("userAddrAsUint", userAddrAsUint);

// const contractAddr = "0x1A5f8D110Fa053543184aF404e344a85f5BC6335";
// const provider = providers["optimism-goerli"];
// const ResidencyStoreABI = [
//   "event USResidency(address,bool)",
//   "function usResidency(address) external view returns (bool)",
//   "function masalaWasUsed(uint256) external view returns (bool)",
// ];
// const contract = new ethers.Contract(contractAddr, ResidencyStoreABI, provider);
// const isUSResident = await contract.usResidency(userAddr);
// const masalaWasUsed = await contract.masalaWasUsed(userAddrAsUint);

// console.log("isUSResident", isUSResident);
// console.log("masalaWasUsed", masalaWasUsed);

async function main() {
  const timeseriesStartDate = new Date("Dec 08 2022").getTime();

  const contractAddr = treeAddrsByNetwork["optimism"];
  const provider = providers["optimism"];
  const MerkleTreeABI = ["event LeafInserted(uint256,uint256)"];
  const contract = new ethers.Contract(contractAddr, MerkleTreeABI, provider);

  const leafInsertedEvents = await contract.queryFilter("LeafInserted", 48162790);
  console.log(leafInsertedEvents);
  // const timeseries = await convertEventsToTimeseries(
  //   leafInsertedEvents,
  //   timeseriesStartDate
  // );
  // if (req.query["only-total"]) {
  //   const newTimeseries = timeseries.map((event) => ({
  //     total: event.total,
  //     dateStr: event.dateStr,
  //   }));
  //   return res.status(200).json({ result: newTimeseries });
  // }
}

main();
