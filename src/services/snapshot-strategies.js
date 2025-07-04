import express from "express";
import { ethers } from "ethers";
import { thisAddress, providers } from "../init.js";
import { logWithTimestamp, assertValidAddress } from "../utils/utils.js";
import {
  defaultActionId,
  hubV3Address,
  govIdIssuerAddress,
  biometricsIssuerAddress,
  v3KYCSybilResistanceCircuitId,
  v3PhoneSybilResistanceCircuitId,
  v3BiometricsSybilResistanceCircuitId,
  phoneIssuerAddress,
} from "../constants/misc.js";
import {
  resStoreAddrsByNetwork,
  sybilResistanceAddrsByNetwork,
  sybilResistancePhoneAddrsByNetwork,
} from "../constants/contractAddresses.js";
import ResidencyStoreABI from "../constants/ResidencyStoreABI.js";
import AntiSybilStoreABI from "../constants/AntiSybilStoreABI.js";
import HubV3ABI from "../constants/HubV3ABI.js";

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

  const network = req.query.network === "420" ? "optimism-goerli" : "optimism";
  const contractAddr = resStoreAddrsByNetwork[network];
  const provider = providers[network];
  const contract = new ethers.Contract(contractAddr, ResidencyStoreABI, provider);

  const snapshot = parseInt(req.query.snapshot);
  const currentBlockNumber = await provider.getBlockNumber();
  if (snapshot < 0 || snapshot > currentBlockNumber) {
    logWithTimestamp("strategies/residesInUS: Snapshot is invalid. Exiting");
    return res.status(400).json({ error: "Snapshot is invalid" });
  }

  const overrides = {
    blockTag: parseInt(req.query.snapshot),
  };

  let scores = [];
  const addresses = req.query.addresses.split(",");
  for (const address of addresses) {
    try {
      const isUSResident = await contract.usResidency(address); //, overrides);
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
async function sybilResistanceGovId(req, res) {
  // TODO: Add support for `network` param
  logWithTimestamp("strategies/sybilResistanceGovId: Entered");
  if (!req.query.addresses) {
    logWithTimestamp(
      "strategies/sybilResistanceGovId: No addresses in query params. Exiting"
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

  const network = req.query.network === "420" ? "optimism-goerli" : "optimism";
  const contractAddr = sybilResistanceAddrsByNetwork[network];
  const provider = providers[network];
  const contract = new ethers.Contract(contractAddr, AntiSybilStoreABI, provider);

  const snapshot = parseInt(req.query.snapshot);
  const currentBlockNumber = await provider.getBlockNumber();
  if (snapshot < 0 || snapshot > currentBlockNumber) {
    logWithTimestamp("strategies/sybilResistanceGovId: Snapshot is invalid. Exiting");
    return res.status(400).json({ error: "Snapshot is invalid" });
  }

  const actionId =
    typeof req.query?.["action-id"] === "number"
      ? parseInt(req.query?.["action-id"])
      : defaultActionId;

  const overrides = {
    blockTag: parseInt(req.query.snapshot),
  };

  let scores = [];
  const addresses = req.query.addresses.split(",");
  for (const address of addresses) {
    try {
      // Check v1/v2 contract
      const isUniqueV1 = await contract.isUniqueForAction(address, actionId); //, overrides);

      // Check v3 contract
      let isUniqueV3 = false;
      try {
        const hubV3Contract = new ethers.Contract(hubV3Address, HubV3ABI, provider);

        const sbt = await hubV3Contract.getSBT(address, v3KYCSybilResistanceCircuitId);

        const publicValues = sbt[1];
        const actionIdInSBT = publicValues[2].toString();
        const issuerAddress = publicValues[4].toHexString();

        const actionIdIsValid = actionId == actionIdInSBT;
        const issuerIsValid = govIdIssuerAddress == issuerAddress;

        isUniqueV3 = issuerIsValid && actionIdIsValid;
      } catch (err) {
        if (!(err.errorArgs?.[0] ?? "").includes("SBT is expired")) {
          throw err;
        }
      }

      const isUnique = isUniqueV1 || isUniqueV3;

      scores.push({ address: address, score: isUnique ? 1 : 0 });
    } catch (err) {
      console.log(err);
      logWithTimestamp(
        `strategies/sybilResistanceGovId: Encountered error while calling smart contract for address ${address}. Exiting`
      );
      return res.status(500).json({ error: "An unexpected error occured" });
    }
  }
  return res.status(200).json({ score: scores });
}

// TODO: sybilResistancePhone is the same as sybilResistancePhone, except for contract address.
// Rewrite to remove code duplication.
async function sybilResistancePhone(req, res) {
  // TODO: Add support for `network` param
  logWithTimestamp("strategies/sybilResistancePhone: Entered");
  if (!req.query.addresses) {
    logWithTimestamp(
      "strategies/sybilResistancePhone: No addresses in query params. Exiting"
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

  const network = req.query.network === "420" ? "optimism-goerli" : "optimism";
  const contractAddr = sybilResistancePhoneAddrsByNetwork[network];
  const provider = providers[network];
  const contract = new ethers.Contract(contractAddr, AntiSybilStoreABI, provider);

  const snapshot = parseInt(req.query.snapshot);
  const currentBlockNumber = await provider.getBlockNumber();
  if (snapshot < 0 || snapshot > currentBlockNumber) {
    logWithTimestamp("strategies/sybilResistancePhone: Snapshot is invalid. Exiting");
    return res.status(400).json({ error: "Snapshot is invalid" });
  }

  const actionId =
    typeof req.query?.["action-id"] === "number"
      ? parseInt(req.query?.["action-id"])
      : defaultActionId;

  const overrides = {
    blockTag: parseInt(req.query.snapshot),
  };

  let scores = [];
  const addresses = req.query.addresses.split(",");
  for (const address of addresses) {
    try {
      // Check v1/v2 contract
      const isUniqueV1 = await contract.isUniqueForAction(address, actionId); //, overrides);

      // Check v3 contract
      let isUniqueV3 = false;
      try {
        const hubV3Contract = new ethers.Contract(hubV3Address, HubV3ABI, provider);

        const sbt = await hubV3Contract.getSBT(
          address,
          v3PhoneSybilResistanceCircuitId
        );

        const publicValues = sbt[1];
        const actionIdInSBT = publicValues[2].toString();
        const issuerAddress = publicValues[4].toHexString();

        const actionIdIsValid = actionId == actionIdInSBT;
        const issuerIsValid = phoneIssuerAddress == issuerAddress;

        isUniqueV3 = issuerIsValid && actionIdIsValid;
      } catch (err) {
        if (!(err.errorArgs?.[0] ?? "").includes("SBT is expired")) {
          throw err;
        }
      }

      const isUnique = isUniqueV1 || isUniqueV3;

      scores.push({ address: address, score: isUnique ? 1 : 0 });
    } catch (err) {
      console.log(err);
      logWithTimestamp(
        `strategies/sybilResistancePhone: Encountered error while calling smart contract for address ${address}. Exiting`
      );
      return res.status(500).json({ error: "An unexpected error occured" });
    }
  }
  return res.status(200).json({ score: scores });
}

// sybilResistanceBiometrics is the same as sybilResistanceGovId, except for contract address.
async function sybilResistanceBiometrics(req, res) {
  // TODO: Add support for `network` param
  logWithTimestamp("strategies/sybilResistanceBiometrics: Entered");
  if (!req.query.addresses) {
    logWithTimestamp(
      "strategies/sybilResistanceBiometrics: No addresses in query params. Exiting"
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

  const network = req.query.network === "420" ? "optimism-goerli" : "optimism";
  const contractAddr = sybilResistanceAddrsByNetwork[network];
  const provider = providers[network];
  const contract = new ethers.Contract(contractAddr, AntiSybilStoreABI, provider);

  const snapshot = parseInt(req.query.snapshot);
  const currentBlockNumber = await provider.getBlockNumber();
  if (snapshot < 0 || snapshot > currentBlockNumber) {
    logWithTimestamp(
      "strategies/sybilResistanceBiometrics: Snapshot is invalid. Exiting"
    );
    return res.status(400).json({ error: "Snapshot is invalid" });
  }

  const actionId =
    typeof req.query?.["action-id"] === "number"
      ? parseInt(req.query?.["action-id"])
      : defaultActionId;

  const overrides = {
    blockTag: parseInt(req.query.snapshot),
  };

  let scores = [];
  const addresses = req.query.addresses.split(",");
  for (const address of addresses) {
    try {
      // not relevant for biometrics
      // Check v1/v2 contract
      // const isUniqueV1 = await contract.isUniqueForAction(address, actionId); //, overrides);

      // Check v3 contract
      let isUniqueV3 = false;
      try {
        const hubV3Contract = new ethers.Contract(hubV3Address, HubV3ABI, provider);

        const sbt = await hubV3Contract.getSBT(
          address,
          v3BiometricsSybilResistanceCircuitId
        );

        const publicValues = sbt[1];
        const actionIdInSBT = publicValues[2].toString();
        const issuerAddress = publicValues[4].toHexString();

        const actionIdIsValid = actionId == actionIdInSBT;
        const issuerIsValid = biometricsIssuerAddress == issuerAddress;

        isUniqueV3 = issuerIsValid && actionIdIsValid;
      } catch (err) {
        if (!(err.errorArgs?.[0] ?? "").includes("SBT is expired")) {
          throw err;
        }
      }

      const isUnique = isUniqueV3;

      scores.push({ address: address, score: isUnique ? 1 : 0 });
    } catch (err) {
      console.log(err);
      logWithTimestamp(
        `strategies/sybilResistanceBiometrics: Encountered error while calling smart contract for address ${address}. Exiting`
      );
      return res.status(500).json({ error: "An unexpected error occured" });
    }
  }
  return res.status(200).json({ score: scores });
}

export {
  residesInUS,
  sybilResistanceGovId,
  sybilResistancePhone,
  sybilResistanceBiometrics,
};
