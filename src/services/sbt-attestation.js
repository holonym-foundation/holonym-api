import { ethers } from "ethers";
import { providers } from "../init.js";
import { logWithTimestamp, assertValidAddress } from "../utils/utils.js";
import { blocklistGetAddress } from "../utils/dynamodb.js";
import { sybilResistanceAddrsByNetwork } from "../constants/contractAddresses.js";
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

function sign(circuitId, actionId, address) {
  const attestor = new ethers.utils.SigningKey(process.env.ATTESTOR_PRIVATE_KEY);

  const digest = ethers.utils.solidityKeccak256(
    ["uint256", "uint256", "address"],
    [circuitId, parseInt(actionId), address]
  );
  const personalSignPreimage = ethers.utils.solidityKeccak256(
    ["string", "bytes32"],
    ["\x19Ethereum Signed Message:\n32", digest]
  );
  return ethers.utils.joinSignature(attestor.signDigest(personalSignPreimage));
}

/**
 * Parse and validate query params.
 */
function parseV3SbtParams(req) {
  const address = req.query.address;
  const actionId = req.query["action-id"] ?? 123456789;
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
  }
}

export async function sybilResistanceGovIdSBT(req, res) {
  try {
    const result = parseV3SbtParams(req);
    if (result.error) return res.status(400).json({ error: result.error });
    const { address, actionId } = result;

    // Check blocklist first
    const blockListResult = await blocklistGetAddress(address);
    if (blockListResult.Item) {
      return res.status(200).json({ isUnique: false });
    }

    const provider = providers.optimism;

    // Check v3 contract
    try {
      const hubV3Contract = new ethers.Contract(hubV3Address, HubV3ABI, provider);

      const sbt = await hubV3Contract.getSBT(address, v3KYCSybilResistanceCircuitId);

      const publicValues = sbt[1];
      const actionIdInSBT = publicValues[2].toString();
      const issuerAddress = publicValues[4].toHexString();

      const actionIdIsValid = actionId == actionIdInSBT;
      const issuerIsValid = govIdIssuerAddress == issuerAddress;
      const isExpired = new Date(sbt[0].toNumber()) < (Date.now() / 1000);
      const isRevoked = sbt[2];

      const isUnique = issuerIsValid && actionIdIsValid && !isRevoked && !isExpired;

      if (isUnique) {
        const signature = sign(v3KYCSybilResistanceCircuitId, actionId, address);
        return res.status(200).json({
          isUnique,
          signature,
          circuitId: v3KYCSybilResistanceCircuitId
        });
      }

      return res.status(200).json({ isUnique });
    } catch (err) {
      if ((err.errorArgs?.[0] ?? "").includes("SBT is expired")) {
        return res.status(200).json({ isUnique: false });
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

export async function sybilResistanceEPassportSBT(req, res) {
  try {
    const result = parseV3SbtParams(req);
    if (result.error) return res.status(400).json({ error: result.error });
    const { address, actionId } = result;

    // Check blocklist first
    const blockListResult = await blocklistGetAddress(address);
    if (blockListResult.Item) {
      return res.status(200).json({ isUnique: false });
    }

    // Check v3 contract for ePassport SBT
    try {
      const hubV3Contract = new ethers.Contract(hubV3Address, HubV3ABI, providers.optimism);

      const sbt = await hubV3Contract.getSBT(address, v3EPassportSybilResistanceCircuitId);

      const publicValues = sbt[1];
      const merkleRoot = publicValues[2].toHexString();
      const isExpired = new Date(sbt[0].toNumber()) < (Date.now() / 1000);
      const isRevoked = sbt[2];

      const isUnique = (merkleRoot === ePassportIssuerMerkleRoot) && !isRevoked && !isExpired;

      if (isUnique) {
        const signature = sign(v3EPassportSybilResistanceCircuitId, actionId, address);
        return res.status(200).json({ 
          isUnique, 
          signature,
          circuitId: v3EPassportSybilResistanceCircuitId
        });
      }

      return res.status(200).json({ isUnique });
    } catch (err) {
      if ((err.errorArgs?.[0] ?? "").includes("SBT is expired or does not exist")) {
        return res.status(200).json({ 
          hasValidSbt: false, 
          message: "SBT is expired or does not exist"
        });
      }

      throw err;
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "An unexpected error occured" });
  }
}

export async function sybilResistancePhoneSBT(req, res) {
  try {
    const result = parseV3SbtParams(req);
    if (result.error) return res.status(400).json({ error: result.error });
    const { address, actionId } = result;

    // Check blocklist first
    const blockListResult = await blocklistGetAddress(address);
    if (blockListResult.Item) {
      return res.status(200).json({ isUnique: false });
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
      const isExpired = new Date(sbt[0].toNumber()) < (Date.now() / 1000);
      const isRevoked = sbt[2];

      const isUnique = issuerIsValid && actionIdIsValid && !isRevoked && !isExpired;

      if (isUnique) {
        const signature = sign(v3PhoneSybilResistanceCircuitId, actionId, address);
        return res.status(200).json({ 
          isUnique, 
          signature, 
          circuitId: v3PhoneSybilResistanceCircuitId 
        });
      }

      return res.status(200).json({ isUnique });
    } catch (err) {
      if ((err.errorArgs?.[0] ?? "").includes("SBT is expired")) {
        return res.status(200).json({ isUnique: false });
      }

      throw err;
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "An unexpected error occured" });
  }
}

export async function getAttestor(req, res) {
  try {
    const attestor = new ethers.Wallet(process.env.ATTESTOR_PRIVATE_KEY);
    return res.status(200).json({ address: attestor.address });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "An unexpected error occured" });
  }
}
