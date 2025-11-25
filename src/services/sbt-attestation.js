import axios from "axios";
import { ethers } from "ethers";
import { providers } from "../init.js";
import { logWithTimestamp, assertValidAddress } from "../utils/utils.js";
import { blocklistGetAddress } from "../utils/dynamodb.js";
import { sybilResistanceAddrsByNetwork } from "../constants/contractAddresses.js";
import {
  hubV3Address,
  govIdIssuerAddress,
  phoneIssuerAddress,
  biometricsIssuerAddress,
  v3KYCSybilResistanceCircuitId,
  v3PhoneSybilResistanceCircuitId,
  v3EPassportSybilResistanceCircuitId,
  v3CleanHandsCircuitId,
  v3BiometricsSybilResistanceCircuitId,
  ePassportIssuerMerkleRoot,
  zeronymCleanHandsEthSignSchemaId,
  zeronymRelayerAddress,
} from "../constants/misc.js";
import AntiSybilStoreABI from "../constants/AntiSybilStoreABI.js";
import SignProtocolABI from "../constants/SignProtocolABI.js";
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
  };
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
      const isExpired = new Date(sbt[0].toNumber()) < Date.now() / 1000;
      const isRevoked = sbt[2];

      const isUnique = issuerIsValid && actionIdIsValid && !isRevoked && !isExpired;

      if (isUnique) {
        const signature = sign(v3KYCSybilResistanceCircuitId, actionId, address);
        return res.status(200).json({
          isUnique,
          signature,
          circuitId: v3KYCSybilResistanceCircuitId,
          expirationDate: sbt[0].toNumber(),
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
      const hubV3Contract = new ethers.Contract(
        hubV3Address,
        HubV3ABI,
        providers.optimism
      );

      const sbt = await hubV3Contract.getSBT(
        address,
        v3EPassportSybilResistanceCircuitId
      );

      const publicValues = sbt[1];
      const merkleRoot = publicValues[2].toHexString();
      const isExpired = new Date(sbt[0].toNumber()) < Date.now() / 1000;
      const isRevoked = sbt[2];

      const isUnique =
        merkleRoot === ePassportIssuerMerkleRoot && !isRevoked && !isExpired;

      if (isUnique) {
        const signature = sign(v3EPassportSybilResistanceCircuitId, actionId, address);
        return res.status(200).json({
          isUnique,
          signature,
          circuitId: v3EPassportSybilResistanceCircuitId,
          expirationDate: sbt[0].toNumber(),
        });
      }

      return res.status(200).json({ isUnique });
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
      const isExpired = new Date(sbt[0].toNumber()) < Date.now() / 1000;
      const isRevoked = sbt[2];

      const isUnique = issuerIsValid && actionIdIsValid && !isRevoked && !isExpired;

      if (isUnique) {
        const signature = sign(v3PhoneSybilResistanceCircuitId, actionId, address);
        return res.status(200).json({
          isUnique,
          signature,
          circuitId: v3PhoneSybilResistanceCircuitId,
          expirationDate: sbt[0].toNumber(),
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

export async function sybilResistanceBiometricsSBT(req, res) {
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

      const isUnique = issuerIsValid && actionIdIsValid && !isRevoked && !isExpired;

      if (isUnique) {
        const signature = sign(
          v3BiometricsSybilResistanceCircuitId,
          actionId,
          address
        );
        return res.status(200).json({
          isUnique,
          signature,
          circuitId: v3BiometricsSybilResistanceCircuitId,
          expirationDate: sbt[0].toNumber(),
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
      "sybilResistanceBiometrics: Encountered error while calling smart contract. Exiting"
    );
    return res.status(500).json({ error: "An unexpected error occured" });
  }
}

function scanSpAttestations(address, page) {
  const queryParams = page ? `?page=${page}` : "";
  return axios.get(
    `https://mainnet-rpc.sign.global/api/scan/addresses/${address}/attestations${queryParams}`
  );
}

export async function cleanHandsAttestation(req, res) {
  try {
    const result = parseV3SbtParams(req);
    if (result.error) return res.status(400).json({ error: result.error });
    const { address, actionId } = result;

    // Check blocklist first
    const blockListResult = await blocklistGetAddress(address);
    if (blockListResult.Item) {
      return res.status(200).json({ isUnique: false });
    }

    // TODO: Remove this block once we finish testing
    const whitelist = ["0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"];
    if (whitelist.includes(address.toLowerCase())) {
      const signature = sign(v3CleanHandsCircuitId, actionId, address);
      return res.status(200).json({
        isUnique: true,
        signature,
        circuitId: v3CleanHandsCircuitId,
      });
    }
    // END TODO

    try {
      let cleanHandsAttestations = [];
      let hasMorePages = true;
      while (hasMorePages) {
        // Query EthSign scan API for user's address
        let resp = null;
        try {
          resp = await scanSpAttestations(address);
        } catch (err) {
          console.log("err", err.response.status, err.response.data);
          // If 404, user has no attestations
          if (err.response.status == 404) {
            return res.status(200).json({ isUnique: false });
          }
        }

        // total == total attestations; page == current page; size == num attestations per page
        hasMorePages =
          resp.data.data.total > resp.data.data.page * resp.data.data.size;

        // Filter for attestations with the correct schemaId
        cleanHandsAttestations = resp.data.data.rows.filter(
          (att) =>
            att.fullSchemaId == zeronymCleanHandsEthSignSchemaId &&
            att.attester == zeronymRelayerAddress &&
            att.isReceiver == true &&
            !att.revoked &&
            att.validUntil > new Date().getTime() / 1000
        );

        if (cleanHandsAttestations.length > 0 || !hasMorePages) {
          break;
        }

        resp = await scanSpAttestations(address, resp.data.data.page + 1);
      }

      if (cleanHandsAttestations.length == 0) {
        return res.status(200).json({ isUnique: false });
      }

      // Call the smart contract directly to be 100% sure the user has the attestation
      const signProtocolOpAddr = "0x945C44803E92a3495C32be951052a62E45A5D964";
      const contract = new ethers.Contract(
        signProtocolOpAddr,
        SignProtocolABI,
        providers.optimism
      );
      const attestationId = cleanHandsAttestations[0].attestationId;
      const attestation = await contract.getAttestation(attestationId);

      // If it's valid, sign and return

      // Sign Protocol attestation recipients are encoded as bytes32, so we need to decode
      const decodedRecipient = new TextDecoder()
        .decode(ethers.utils.arrayify(attestation.recipients[0]))
        .replaceAll("\x00", "")
        .trim()
        .replace("*", "");
      if (decodedRecipient.toLowerCase() != address.toLowerCase()) {
        return res.status(200).json({ isUnique: false });
      }

      const signature = sign(v3CleanHandsCircuitId, actionId, address);
      return res.status(200).json({
        isUnique: true,
        signature,
        circuitId: v3CleanHandsCircuitId,
      });
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
