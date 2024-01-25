import express from "express";
import { ethers } from "ethers";
import { thisAddress, providers } from "../init.js";
import { logWithTimestamp, assertValidAddress } from "../utils/utils.js";
import { blocklistGetAddress } from "../utils/dynamodb.js";
import {
  sybilResistanceAddrsByNetwork,
  sybilResistancePhoneAddrsByNetwork,
} from "../constants/contractAddresses.js";
import AntiSybilStoreABI from "../constants/AntiSybilStoreABI.js";

async function sybilResistanceGovId(req, res) {
  try {
    const address = req.query.user;
    const actionId = req.query["action-id"];
    if (!address) {
      return res
        .status(400)
        .json({ error: "Request query params do not include user address" });
    }
    if (!actionId) {
      return res
        .status(400)
        .json({ error: "Request query params do not include action-id" });
    }
    if (!assertValidAddress(address)) {
      return res.status(400).json({ error: "Invalid user address" });
    }
    if (!parseInt(actionId)) {
      return res.status(400).json({ error: "Invalid action-id" });
    }

    // Check blocklist first
    const result = await blocklistGetAddress(address);
    if (result.Item) {
      return res.status(200).json({ result: false });
    }

    const network = req.params.network;

    const provider = providers[network];

    const v1ContractAddr = sybilResistanceAddrsByNetwork[network];
    const v1Contract = new ethers.Contract(
      v1ContractAddr,
      AntiSybilStoreABI,
      provider
    );
    const isUnique = await v1Contract.isUniqueForAction(address, actionId);

    return res.status(200).json({ result: isUnique });
  } catch (err) {
    console.log(err);
    logWithTimestamp(
      "sybilResistanceGovId: Encountered error while calling smart contract. Exiting"
    );
    return res.status(500).json({ error: "An unexpected error occured" });
  }
}

async function sybilResistancePhone(req, res) {
  logWithTimestamp("sybilResistancePhone: Entered");
  if (!req.query.user) {
    logWithTimestamp("sybilResistancePhone: No user in query params. Exiting");
    return res
      .status(400)
      .json({ error: "Request query params do not include user address" });
  }
  if (!req.query["action-id"]) {
    logWithTimestamp("sybilResistancePhone: No action-id in query params. Exiting");
    return res
      .status(400)
      .json({ error: "Request query params do not include action-id" });
  }
  if (!assertValidAddress(req.query.user)) {
    logWithTimestamp("sybilResistancePhone: Invalid address. Exiting");
    return res.status(400).json({ error: "Invalid user address" });
  }
  if (!parseInt(req.query["action-id"])) {
    logWithTimestamp("sybilResistancePhone: Invalid action-id. Exiting");
    return res.status(400).json({ error: "Invalid action-id" });
  }
  const contractAddr = sybilResistancePhoneAddrsByNetwork[req.params.network];
  const provider = providers[req.params.network];
  try {
    const contract = new ethers.Contract(contractAddr, AntiSybilStoreABI, provider);
    const isUnique = await contract.isUniqueForAction(
      req.query.user,
      req.query["action-id"]
    );
    return res.status(200).json({ result: isUnique });
  } catch (err) {
    console.log(err);
    logWithTimestamp(
      "sybilResistancePhone: Encountered error while calling smart contract. Exiting"
    );
    return res.status(500).json({ error: "An unexpected error occured" });
  }
}

export { sybilResistanceGovId, sybilResistancePhone };
