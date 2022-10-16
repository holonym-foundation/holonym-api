import express from "express";
import { ethers } from "ethers";
import { thisAddress, provider } from "../init.js";
import { logWithTimestamp, assertValidAddress } from "../utils/utils.js";
import contractAddresses from "../constants/contractAddresses.js";
import AntiSybilStoreABI from "../constants/AntiSybilStoreABI.js";

async function sybilResistance(req, res) {
  logWithTimestamp("sybilResistance: Entered");
  if (!req.query.user) {
    logWithTimestamp("sybilResistance: No user in query params. Exiting");
    return res
      .status(400)
      .json({ error: "Request query params do not include user address" });
  }
  if (!req.query["app-id"]) {
    logWithTimestamp("sybilResistance: No app-id in query params. Exiting");
    return res
      .status(400)
      .json({ error: "Request query params do not include app-id" });
  }
  if (!assertValidAddress(req.query.user)) {
    logWithTimestamp("sybilResistance: Invalid address. Exiting");
    return res.status(400).json({ error: "Invalid user address" });
  }
  const contractAddr = contractAddresses["optimistic-goerli"]["AntiSybilStore"];
  try {
    const contract = new ethers.Contract(contractAddr, AntiSybilStoreABI, provider);
    const isUnique = await contract.isUniqueForAction(
      req.query.user,
      req.query["app-id"]
    );
    return res.status(200).json({ result: isUnique });
  } catch (err) {
    console.log(err);
    logWithTimestamp(
      "sybilResistance: Encountered error while calling smart contract. Exiting"
    );
    return res.status(500).json({ error: "An unexpected error occured" });
  }
}

export { sybilResistance };
