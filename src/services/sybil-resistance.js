import express from "express";
import { ethers } from "ethers";
import { thisAddress, providers } from "../init.js";
import { logWithTimestamp, assertValidAddress } from "../utils/utils.js";
import { blocklistGetAddress } from "../utils/dynamodb.js";
import {
  sybilResistanceAddrsByNetwork,
  sybilResistancePhoneAddrsByNetwork,
} from "../constants/contractAddresses.js";
import {
  hubV3Address,
  govIdIssuerAddress,
  v3KYCSybilResistanceCircuitId,
} from "../constants/misc.js";
import AntiSybilStoreABI from "../constants/AntiSybilStoreABI.js";
import HubV3ABI from "../constants/HubV3ABI.js";

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
    const blockListResult = await blocklistGetAddress(address);
    if (blockListResult.Item) {
      return res.status(200).json({ result: false });
    }

    const network = req.params.network;

    const provider = providers[network];

    // Check v1/v2 contract
    const v1ContractAddr = sybilResistanceAddrsByNetwork[network];
    const v1Contract = new ethers.Contract(
      v1ContractAddr,
      AntiSybilStoreABI,
      provider
    );
    const isUnique = await v1Contract.isUniqueForAction(address, actionId);

    if (isUnique || network !== "optimism") {
      return res.status(200).json({ result: isUnique });
    }

    // Check v3 contract
    try {
      const hubV3Contract = new ethers.Contract(hubV3Address, HubV3ABI, provider);

      const sbt = await hubV3Contract.getSBT(address, v3KYCSybilResistanceCircuitId);

      const publicValues = sbt[1];
      const issuerAddress = publicValues[4];

      return res
        .status(200)
        .json({ result: govIdIssuerAddress === issuerAddress.toHexString() });
    } catch (err) {
      if ((err.errorArgs?.[0] ?? "").includes("SBT is expired")) {
        return res.status(200).json({ result: false });
      }

      throw err;
    }
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
