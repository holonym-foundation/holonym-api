import express from "express";
import { ethers } from "ethers";
import { thisAddress, providers } from "../init.js";
import { logWithTimestamp, assertValidAddress } from "../utils/utils.js";
import { defaultActionId } from "../constants/misc.js";
import {
  resStoreAddrsByNetwork,
  sybilResistanceAddrsByNetwork,
} from "../constants/contractAddresses.js";
import ResidencyStoreABI from "../constants/ResidencyStoreABI.js";
import AntiSybilStoreABI from "../constants/AntiSybilStoreABI.js";

/**
 * Query params: network, snapshot, addresses.
 *
 * See the "api" Snapshot strategy for strategy implementation
 * (repo: https://github.com/snapshot-labs/snapshot-strategies)
 */
async function residesInUS(req, res) {
  // TODO: Add support for `network` param
  logWithTimestamp("strategies/residesInUS: Entered");
  if (!req.query.addresses) {
    logWithTimestamp("strategies/residesInUS: No addresses in query params. Exiting");
    return res
      .status(400)
      .json({ error: "Request query params do not include addresses" });
  }
  if (!req.query.snapshot) {
    logWithTimestamp("strategies/residesInUS: No snapshot in query params. Exiting");
    return res
      .status(400)
      .json({ error: "Request query params do not include snapshot" });
  }
  const snapshot = parseInt(req.query.snapshot);
  const currentBlockNumber = await provider.getBlockNumber();
  if (snapshot < 0 || snapshot > currentBlockNumber) {
    logWithTimestamp("strategies/residesInUS: Snapshot is invalid. Exiting");
    return res.status(400).json({ error: "Snapshot is invalid" });
  }

  const network = req.query.network === "420" ? "optimism-goerli" : "optimism";
  const contractAddr = resStoreAddrsByNetwork[network];
  const provider = providers[network];
  const contract = new ethers.Contract(contractAddr, ResidencyStoreABI, provider);

  const overrides = {
    blockTag: parseInt(req.query.snapshot),
  };

  let scores = [];
  const addresses = req.query.addresses.split(",");
  for (const address of addresses) {
    try {
      const isUSResident = await contract.usResidency(address, overrides);
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

/**
 * NOTE: Does not support network or snapshot params. This endpoint only queries
 * Optimism Goerli, and it checks the contract _at the time the endpoint is called_,
 * not at the time of the given snapshot.
 *
 * Query params: network, snapshot, addresses, action-id.
 *
 * See the "api" Snapshot strategy for strategy implementation
 * (repo: https://github.com/snapshot-labs/snapshot-strategies)
 *
 * action-id param must be passed as to options.additionalParameters in strategy.
 * For example, "action-id=123"
 */
async function sybilResistance(req, res) {
  // TODO: Add support for `network` param
  logWithTimestamp("strategies/sybilResistance: Entered");
  if (!req.query.addresses) {
    logWithTimestamp(
      "strategies/sybilResistance: No addresses in query params. Exiting"
    );
    return res
      .status(400)
      .json({ error: "Request query params do not include addresses" });
  }
  if (!req.query.snapshot) {
    logWithTimestamp("strategies/residesInUS: No snapshot in query params. Exiting");
    return res
      .status(400)
      .json({ error: "Request query params do not include snapshot" });
  }
  const snapshot = parseInt(req.query.snapshot);
  const currentBlockNumber = await provider.getBlockNumber();
  if (snapshot < 0 || snapshot > currentBlockNumber) {
    logWithTimestamp("strategies/residesInUS: Snapshot is invalid. Exiting");
    return res.status(400).json({ error: "Snapshot is invalid" });
  }

  const network = req.query.network == "420" ? "optimism-goerli" : "optimism";
  const contractAddr = sybilResistanceAddrsByNetwork[network];
  const provider = providers[network];
  const contract = new ethers.Contract(contractAddr, AntiSybilStoreABI, provider);

  const actionId =
    typeof req.query?.["action-id"] == "number"
      ? parseInt(req.query?.["action-id"])
      : defaultActionId;

  const overrides = {
    blockTag: parseInt(req.query.snapshot),
  };

  let scores = [];
  const addresses = req.query.addresses.split(",");
  for (const address of addresses) {
    try {
      const isUnique = await contract.isUniqueForAction(address, actionId, overrides);
      scores.push({ address: address, score: isUnique ? 1 : 0 });
    } catch (err) {
      console.log(err);
      logWithTimestamp(
        `strategies/sybilResistance: Encountered error while calling smart contract for address ${address}. Exiting`
      );
      return res.status(500).json({ error: "An unexpected error occured" });
    }
  }
  return res.status(200).json({ score: scores });
}

export { residesInUS, sybilResistance };
