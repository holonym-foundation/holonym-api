import express from "express";
import { ethers } from "ethers";
import { thisAddress, provider } from "../init.js";
import { logWithTimestamp } from "../utils/utils.js";
import contractAddresses from "../constants/contractAddresses.js";
import ResidencyStoreABI from "../constants/ResidencyStoreABI.js";
import AntiSybilStoreABI from "../constants/AntiSybilStoreABI.js";

async function usResidencyCount(req, res) {
  logWithTimestamp("usResidencyCount: Entered");
  const contractAddr = contractAddresses["optimistic-goerli"]["ResidencyStore"];
  try {
    const contract = new ethers.Contract(contractAddr, ResidencyStoreABI, provider);
    const usResidencyEvents = await contract.queryFilter("USResidency");
    const count = usResidencyEvents?.length > 0 ? usResidencyEvents.length : 0;
    return res.status(200).json({ result: count });
  } catch (err) {
    console.log(err);
    logWithTimestamp(
      "usResidencyCount: Encountered error while getting smart contract events. Exiting"
    );
    return res.status(500).json({ error: "An unexpected error occured" });
  }
}

async function sybilResistanceCount(req, res) {
  logWithTimestamp("sybilResistanceCount: Entered");
  const contractAddr = contractAddresses["optimistic-goerli"]["AntiSybilStore"];
  try {
    const contract = new ethers.Contract(contractAddr, AntiSybilStoreABI, provider);
    const uniquenessEvents = await contract.queryFilter("Uniqueness");
    const count = uniquenessEvents?.length > 0 ? uniquenessEvents.length : 0;
    return res.status(200).json({ result: count });
  } catch (err) {
    console.log(err);
    logWithTimestamp(
      "sybilResistanceCount: Encountered error while getting smart contract events. Exiting"
    );
    return res.status(500).json({ error: "An unexpected error occured" });
  }
}

export { usResidencyCount, sybilResistanceCount };
