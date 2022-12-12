import express from "express";
import { ethers } from "ethers";
import { thisAddress, providers } from "../init.js";
import { logWithTimestamp } from "../utils/utils.js";
import { hubAddrsByNetwork } from "../constants/contractAddresses.js";
import HubABI from "../constants/HubABI.js";

async function getLeaves(req, res) {
  logWithTimestamp("getLeaves: Entered");
  const contractAddr = hubAddrsByNetwork[req.params.network];
  try {
    const provider = providers[req.params.network];
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
