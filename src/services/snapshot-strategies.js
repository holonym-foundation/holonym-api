import express from "express";
import { ethers } from "ethers";
import { thisAddress, provider } from "../init.js";
import { logWithTimestamp, assertValidAddress } from "../utils/utils.js";
import contractAddresses from "../constants/contractAddresses.js";
import ResidencyStoreABI from "../constants/ResidencyStoreABI.js";

/**
 * NOTE: Does not support network or snapshot params. This endpoint only queries
 * Optimism Goerli, and it checks the contract _at the time the endpoint is called_,
 * not at the time of the given snapshot.
 *
 * Query params: network, snapshot, addresses.
 *
 * See the "api" Snapshot strategy for strategy implementation
 * (repo: https://github.com/snapshot-labs/snapshot-strategies)
 */
async function residesInUS(req, res) {
  logWithTimestamp("strategies/residesInUS: Entered");
  if (!req.query.addresses) {
    logWithTimestamp("strategies/residesInUS: No addresses in query params. Exiting");
    return res
      .status(400)
      .json({ error: "Request query params do not include addresses" });
  }
  const contractAddr = contractAddresses["optimistic-goerli"]["ResidencyStore"];
  const contract = new ethers.Contract(contractAddr, ResidencyStoreABI, provider);

  let scores = [];
  const addresses = req.query.addresses.split(",");
  for (const address of addresses) {
    try {
      const isUSResident = await contract.usResidency(address);
      scores.push({ address: address, score: isUSResident ? 1 : 0 });
    } catch (err) {
      console.log(err);
      logWithTimestamp(
        `strategies/residesInUS: Encountered error while calling smart contract for address ${address}. Exiting`
      );
      return res.status(500).json({ error: "An unexpected error occured" });
    }
  }
  return res.status(200).json({ score: scores });
}

export { residesInUS };
