import express from "express";
import { ethers } from "ethers";
import { thisAddress, provider } from "../init.js";
import { logWithTimestamp, assertValidAddress } from "../utils/utils.js";
import contractAddresses from "../constants/contractAddresses.js";
import ResidencyStoreABI from "../constants/ResidencyStoreABI.js";

async function getResidesInUS(req, res) {
  logWithTimestamp("getResidesInUS: Entered");
  if (!req.query.user) {
    logWithTimestamp("getResidesInUS: No user in query params. Exiting");
    return res
      .status(400)
      .json({ error: "Request query params do not include user address" });
  }
  if (!assertValidAddress(req.query.user)) {
    logWithTimestamp("getResidesInUS: Invalid address. Exiting");
    return res.status(400).json({ error: "Invalid user address" });
  }
  // TODO: Update when contracts are deployed to mainnet
  const contractAddr = contractAddresses["IsUSResident"]["testnet"]["optimism-goerli"];
  try {
    const contract = new ethers.Contract(contractAddr, ResidencyStoreABI, provider);
    const isUSResident = await contract.usResidency(req.query.user);
    return res.status(200).json({ result: isUSResident });
  } catch (err) {
    console.log(err);
    logWithTimestamp(
      "getResidesInUS: Encountered error while calling smart contract. Exiting"
    );
    return res.status(500).json({ error: "An unexpected error occured" });
  }
}

export { getResidesInUS };
