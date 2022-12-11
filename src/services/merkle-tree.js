import express from "express";
import { ethers } from "ethers";
import { thisAddress, provider } from "../init.js";
import { logWithTimestamp } from "../utils/utils.js";
import contractAddresses from "../constants/contractAddresses.js";
import HubABI from "../constants/HubABI.js";

async function getLeaves(req, res) {
  logWithTimestamp("getLeaves: Entered");
  // TODO: Update when contracts are deployed to mainnet
  const contractAddr = contractAddresses["Hub"]["testnet"]["optimism-goerli"];
  try {
    const contract = new ethers.Contract(contractAddr, HubABI, provider);
    const leaves = await contract.getLeaves();
    return res.status(200).json({ result: leaves });
  } catch (err) {
    console.log(err);
    logWithTimestamp(
      "getLeaves: Encountered error while calling smart contract. Exiting"
    );
    return res.status(500).json({ error: "An unexpected error occured" });
  }
}

export { getLeaves };
