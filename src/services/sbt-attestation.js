import { ethers } from "ethers";
import { providers } from "../init.js";
import { logWithTimestamp, assertValidAddress } from "../utils/utils.js";
import { blocklistGetAddress } from "../utils/dynamodb.js";
import { sybilResistanceAddrsByNetwork } from "../constants/contractAddresses.js";
import {
  hubV3Address,
  govIdIssuerAddress,
  v3KYCSybilResistanceCircuitId,
} from "../constants/misc.js";
import AntiSybilStoreABI from "../constants/AntiSybilStoreABI.js";
import HubV3ABI from "../constants/HubV3ABI.js";

function sign(actionId, address) {
  const attestor = new ethers.utils.SigningKey(process.env.ATTESTOR_PRIVATE_KEY);

  const digest = ethers.utils.solidityKeccak256(
    ["uint256", "address"],
    [parseInt(actionId), address]
  );
  const personalSignPreimage = ethers.utils.solidityKeccak256(
    ["string", "bytes32"],
    ["\x19Ethereum Signed Message:\n32", digest]
  );
  return ethers.utils.joinSignature(attestor.signDigest(personalSignPreimage));
}

export async function sybilResistanceGovIdSBT(req, res) {
  try {
    const address = req.query.user;
    const actionId = req.query["action-id"];
    if (!address) {
      return res.status(400).json({ error: "address query parameter is required" });
    }
    if (!actionId) {
      return res.status(400).json({ error: "action-id query parameter is required" });
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
      return res.status(200).json({ isUnique: false });
    }

    const provider = providers.optimism;

    // Check v1/v2 contract
    const v1ContractAddr = sybilResistanceAddrsByNetwork.optimism;
    const v1Contract = new ethers.Contract(
      v1ContractAddr,
      AntiSybilStoreABI,
      provider
    );
    const isUnique = await v1Contract.isUniqueForAction(address, actionId);

    if (isUnique) {
      const signature = sign(actionId, address);
      return res.status(200).json({ isUnique, signature });
    }

    // Check v3 contract
    try {
      const hubV3Contract = new ethers.Contract(hubV3Address, HubV3ABI, provider);

      const sbt = await hubV3Contract.getSBT(address, v3KYCSybilResistanceCircuitId);

      const publicValues = sbt[1];
      const actionIdInSBT = publicValues[2].toString();
      const issuerAddress = publicValues[4].toHexString();

      const actionIdIsValid = actionId == actionIdInSBT;
      const issuerIsValid = govIdIssuerAddress == issuerAddress;

      const isUnique = issuerIsValid && actionIdIsValid;

      if (isUnique) {
        const signature = sign(actionId, address);
        return res.status(200).json({ isUnique, signature });
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

export async function getAttestor(req, res) {
  try {
    const attestor = new ethers.Wallet(process.env.ATTESTOR_PRIVATE_KEY);
    return res.status(200).json({ address: attestor.address });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "An unexpected error occured" });
  }
}
