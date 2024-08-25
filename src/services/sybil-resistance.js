import express from "express";
import { ethers } from "ethers";
import { thisAddress, providers } from "../init.js";
import { logWithTimestamp, assertValidAddress } from "../utils/utils.js";
import { blocklistGetAddress } from "../utils/dynamodb.js";
import { viewHubV3Sbt } from "../utils/near.js";
import {
  sybilResistanceAddrsByNetwork,
  sybilResistancePhoneAddrsByNetwork,
} from "../constants/contractAddresses.js";
import {
  hubV3Address,
  govIdIssuerAddress,
  phoneIssuerAddress,
  v3KYCSybilResistanceCircuitId,
  v3PhoneSybilResistanceCircuitId,
  v3EPassportSybilResistanceCircuitId,
  ePassportIssuerMerkleRoot,
} from "../constants/misc.js";
import AntiSybilStoreABI from "../constants/AntiSybilStoreABI.js";
import HubV3ABI from "../constants/HubV3ABI.js";

async function sybilResistanceGovIdNear(req, res) {
  const user = req.query.user;

  // Check for KYC SBT
  try {
    const sbt = await viewHubV3Sbt(
      user,
      new Array(...ethers.utils.arrayify(v3KYCSybilResistanceCircuitId))
    );

    const expiry = sbt.expiry;
    const publicValues = sbt.public_values;

    const actionIdInSBT = ethers.utils.hexlify(publicValues[2]);
    const issuerAddress = ethers.utils.hexlify(publicValues[4]);

    const expired = expiry < Date.now() / 1000;
    const actionIdIsValid = actionId == actionIdInSBT;
    const issuerIsValid = govIdIssuerAddress == issuerAddress;

    return res.status(200).json({
      result: !expired && actionIdIsValid && issuerIsValid,
    });
  } catch (err) {
    if ((err?.message ?? "").includes("SBT does not exist")) {
      // Do nothing
    } else {
      console.log(err);
      res.status(500).json({ error: "An unexpected error occured" });
    }
  }

  // Check for ePassport SBT
  try {
    const sbt = await viewHubV3Sbt(
      user,
      new Array(...ethers.utils.arrayify(v3EPassportSybilResistanceCircuitId))
    );

    const expiry = sbt.expiry;
    const publicValues = sbt.public_values;

    const expired = expiry < Date.now() / 1000;
    const validRoot =
      ethers.utils.hexlify(publicValues[2]) === ePassportIssuerMerkleRoot;

    return res.status(200).json({
      result: !expired && validRoot,
    });
  } catch (err) {
    if ((err?.message ?? "").includes("SBT does not exist")) {
      console.log(err);
      return res.status(200).json({ result: false });
    }

    console.log(err);
    res.status(500).json({ error: "An unexpected error occured" });
  }

  return res.status(200).json({ result: false });
}

// ---------------------------------------------
// Endpoints
// ---------------------------------------------

async function sybilResistanceGovId(req, res) {
  try {
    if (req.params.network === "near") {
      return await sybilResistanceGovIdNear(req, res);
    }

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

    const hubV3Contract = new ethers.Contract(hubV3Address, HubV3ABI, provider);

    // Check v3 contract for KYC SBT
    try {
      const sbt = await hubV3Contract.getSBT(address, v3KYCSybilResistanceCircuitId);

      const publicValues = sbt[1];
      const actionIdInSBT = publicValues[2].toString();
      const issuerAddress = publicValues[4].toHexString();

      const actionIdIsValid = actionId == actionIdInSBT;
      const issuerIsValid = govIdIssuerAddress == issuerAddress;

      if (actionIdIsValid && issuerIsValid) {
        return res.status(200).json({ result: true });
      }
    } catch (err) {
      // Do nothing
    }

    // Check v3 contract for ePassport SBT
    try {
      const sbt = await hubV3Contract.getSBT(
        address,
        v3EPassportSybilResistanceCircuitId
      );

      const publicValues = sbt[1];
      const merkleRoot = publicValues[2].toHexString();

      return res.status(200).json({
        result: merkleRoot === ePassportIssuerMerkleRoot,
      });
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

async function sybilResistanceEPassport(req, res) {
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

    // Check v3 contract
    try {
      const hubV3Contract = new ethers.Contract(hubV3Address, HubV3ABI, provider);

      const sbt = await hubV3Contract.getSBT(
        address,
        v3EPassportSybilResistanceCircuitId
      );

      const publicValues = sbt[1];
      const merkleRoot = publicValues[2].toHexString();

      return res.status(200).json({
        result: merkleRoot === ePassportIssuerMerkleRoot,
      });
    } catch (err) {
      if ((err.errorArgs?.[0] ?? "").includes("SBT is expired")) {
        return res.status(200).json({ result: false });
      }

      throw err;
    }
  } catch (err) {
    console.log(err);
    logWithTimestamp(
      "sybilResistanceEPassport: Encountered error while calling smart contract. Exiting"
    );
    return res.status(500).json({ error: "An unexpected error occured" });
  }
}

async function sybilResistancePhone(req, res) {
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
    const v1ContractAddr = sybilResistancePhoneAddrsByNetwork[network];
    const contract = new ethers.Contract(v1ContractAddr, AntiSybilStoreABI, provider);
    const isUnique = await contract.isUniqueForAction(address, actionId);

    if (isUnique || network !== "optimism") {
      return res.status(200).json({ result: isUnique });
    }

    // Check v3 contract
    try {
      const hubV3Contract = new ethers.Contract(hubV3Address, HubV3ABI, provider);

      const sbt = await hubV3Contract.getSBT(address, v3PhoneSybilResistanceCircuitId);

      const publicValues = sbt[1];
      const actionIdInSBT = publicValues[2].toString();
      const issuerAddress = publicValues[4].toHexString();

      const actionIdIsValid = actionId == actionIdInSBT;
      const issuerIsValid = phoneIssuerAddress == issuerAddress;

      return res.status(200).json({
        result: issuerIsValid && actionIdIsValid,
      });
    } catch (err) {
      if ((err.errorArgs?.[0] ?? "").includes("SBT is expired")) {
        return res.status(200).json({ result: false });
      }

      throw err;
    }
  } catch (err) {
    console.log(err);
    logWithTimestamp(
      "sybilResistancePhone: Encountered error while calling smart contract. Exiting"
    );
    return res.status(500).json({ error: "An unexpected error occured" });
  }
}

export { sybilResistanceGovId, sybilResistanceEPassport, sybilResistancePhone };
