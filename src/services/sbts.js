/**
 * These endpoints are very similar to the ones in sybil-resistance.js.
 * But these endpoints exist because we need to simply check whether
 * a user has a valid V3 SBT, which is slightly different from what
 * the endpoints in sybil-resistance.js do.
 */
import { ethers } from "ethers";
import { providers } from "../init.js";
import { logWithTimestamp, assertValidAddress } from "../utils/utils.js";
import { blocklistGetAddress } from "../utils/dynamodb.js";
import {
  hubV3Address,
  govIdIssuerAddress,
  phoneIssuerAddress,
  biometricsIssuerAddress,
  v3KYCSybilResistanceCircuitId,
  v3PhoneSybilResistanceCircuitId,
  v3EPassportSybilResistanceCircuitId,
  v3BiometricsSybilResistanceCircuitId,
  ePassportIssuerMerkleRoot,
} from "../constants/misc.js";
import HubV3ABI from "../constants/HubV3ABI.js";

/**
 * Parse and validate query params.
 */
function parseV3SbtParams(req) {
  const address = req.query.address;
  // We hardcode actionId right now because there's only one actionId in use.
  const actionId = 123456789;
  // const actionId = req.query["action-id"];
  if (!address) {
    return { error: "Request query params do not include user address" };
  }
  if (!actionId) {
    return { error: "Request query params do not include action-id" };
  }
  if (!assertValidAddress(address)) {
    return { error: "Invalid user address" };
  }
  if (!parseInt(actionId)) {
    return { error: "Invalid action-id" };
  }

  return {
    address,
    actionId,
  };
}

export async function getHasValidKycSbt(req, res) {
  try {
    const result = parseV3SbtParams(req);
    if (result.error) return res.status(400).json({ error: result.error });
    const { address, actionId } = result;

    // Check blocklist first
    const blockListResult = await blocklistGetAddress(address);
    if (blockListResult.Item) {
      return res.status(200).json({
        hasValidSbt: false,
        message: "Address is on blocklist",
      });
    }

    const hubV3Contract = new ethers.Contract(
      hubV3Address,
      HubV3ABI,
      providers.optimism
    );

    // Check v3 contract for KYC SBT
    try {
      const sbt = await hubV3Contract.getSBT(address, v3KYCSybilResistanceCircuitId);

      const publicValues = sbt[1];
      const actionIdInSBT = publicValues[2].toString();
      const issuerAddress = publicValues[4].toHexString();

      const actionIdIsValid = actionId == actionIdInSBT;
      const issuerIsValid = govIdIssuerAddress == issuerAddress;
      const isExpired = new Date(sbt[0].toNumber()) < Date.now() / 1000;
      const isRevoked = sbt[2];

      return res.status(200).json({
        hasValidSbt: actionIdIsValid && issuerIsValid && !isRevoked && !isExpired,
      });
    } catch (err) {
      // Do nothing
      if ((err.errorArgs?.[0] ?? "").includes("SBT is expired or does not exist")) {
        return res.status(200).json({
          hasValidSbt: false,
          message: "SBT is expired or does not exist",
        });
      }

      throw err;
    }
  } catch (err) {
    console.log(err);
    logWithTimestamp(
      "getHasValidKycSbt: Encountered error while calling smart contract. Exiting"
    );
    return res.status(500).json({ error: "An unexpected error occured" });
  }
}

export async function getHasValidBiometricsSbt(req, res) {
  try {
    const result = parseV3SbtParams(req);
    if (result.error) return res.status(400).json({ error: result.error });
    const { address, actionId } = result;

    // Check blocklist first
    const blockListResult = await blocklistGetAddress(address);
    if (blockListResult.Item) {
      return res.status(200).json({
        hasValidSbt: false,
        message: "Address is on blocklist",
      });
    }

    const hubV3Contract = new ethers.Contract(
      hubV3Address,
      HubV3ABI,
      providers.optimism
    );

    // Check v3 contract for Biometrics SBT
    try {
      const sbt = await hubV3Contract.getSBT(
        address,
        v3BiometricsSybilResistanceCircuitId
      );

      const publicValues = sbt[1];
      const actionIdInSBT = publicValues[2].toString();
      const issuerAddress = publicValues[4].toHexString();

      const actionIdIsValid = actionId == actionIdInSBT;
      const issuerIsValid = biometricsIssuerAddress == issuerAddress;
      const isExpired = new Date(sbt[0].toNumber()) < Date.now() / 1000;
      const isRevoked = sbt[2];

      return res.status(200).json({
        hasValidSbt: actionIdIsValid && issuerIsValid && !isRevoked && !isExpired,
      });
    } catch (err) {
      // Do nothing
      if ((err.errorArgs?.[0] ?? "").includes("SBT is expired or does not exist")) {
        return res.status(200).json({
          hasValidSbt: false,
          message: "SBT is expired or does not exist",
        });
      }

      throw err;
    }
  } catch (err) {
    console.log(err);
    logWithTimestamp(
      "getHasValidBiometricsSbt: Encountered error while calling smart contract. Exiting"
    );
    return res.status(500).json({ error: "An unexpected error occured" });
  }
}

export async function getHasValidEPassportSbt(req, res) {
  try {
    const result = parseV3SbtParams(req);
    if (result.error) return res.status(400).json({ error: result.error });
    const { address, actionId } = result;

    // Check blocklist first
    const blockListResult = await blocklistGetAddress(address);
    if (blockListResult.Item) {
      return res.status(200).json({
        hasValidSbt: false,
        message: "Address is on blocklist",
      });
    }

    const hubV3Contract = new ethers.Contract(
      hubV3Address,
      HubV3ABI,
      providers.optimism
    );

    // Check v3 contract for ePassport SBT
    try {
      const sbt = await hubV3Contract.getSBT(
        address,
        v3EPassportSybilResistanceCircuitId
      );

      const publicValues = sbt[1];
      const merkleRoot = publicValues[2].toHexString();
      const isExpired = new Date(sbt[0].toNumber()) < Date.now() / 1000;
      const isRevoked = sbt[2];

      return res.status(200).json({
        hasValidSbt:
          merkleRoot === ePassportIssuerMerkleRoot && !isRevoked && !isExpired,
      });
    } catch (err) {
      if ((err.errorArgs?.[0] ?? "").includes("SBT is expired or does not exist")) {
        return res.status(200).json({
          hasValidSbt: false,
          message: "SBT is expired or does not exist",
        });
      }

      throw err;
    }
  } catch (err) {
    console.log(err);
    logWithTimestamp(
      "getHasValidEPassportSbt: Encountered error while calling smart contract. Exiting"
    );
    return res.status(500).json({ error: "An unexpected error occured" });
  }
}

export async function getHasPhoneSbt(req, res) {
  try {
    const result = parseV3SbtParams(req);
    if (result.error) return res.status(400).json({ error: result.error });
    const { address, actionId } = result;

    // Check blocklist first
    const blockListResult = await blocklistGetAddress(address);
    if (blockListResult.Item) {
      return res.status(200).json({
        hasValidSbt: false,
        message: "Address is on blocklist",
      });
    }

    const provider = providers.optimism;

    // Check v3 contract
    try {
      const hubV3Contract = new ethers.Contract(hubV3Address, HubV3ABI, provider);

      const sbt = await hubV3Contract.getSBT(address, v3PhoneSybilResistanceCircuitId);

      const publicValues = sbt[1];
      const actionIdInSBT = publicValues[2].toString();
      const issuerAddress = publicValues[4].toHexString();

      const actionIdIsValid = actionId == actionIdInSBT;
      const issuerIsValid = phoneIssuerAddress == issuerAddress;
      const isExpired = new Date(sbt[0].toNumber()) < Date.now() / 1000;
      const isRevoked = sbt[2];

      return res.status(200).json({
        hasValidSbt: issuerIsValid && actionIdIsValid && !isRevoked && !isExpired,
      });
    } catch (err) {
      if ((err.errorArgs?.[0] ?? "").includes("SBT is expired or does not exist")) {
        return res.status(200).json({
          hasValidSbt: false,
          message: "SBT is expired or does not exist",
        });
      }

      throw err;
    }
  } catch (err) {
    console.log(err);
    logWithTimestamp(
      "getHasPhoneSbt: Encountered error while calling smart contract. Exiting"
    );
    return res.status(500).json({ error: "An unexpected error occured" });
  }
}
