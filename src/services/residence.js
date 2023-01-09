import express from "express";
import { ethers } from "ethers";
import { thisAddress, providers } from "../init.js";
import { logWithTimestamp, assertValidAddress } from "../utils/utils.js";
import { resStoreAddrsByNetwork } from "../constants/contractAddresses.js";
import ResidencyStoreABI from "../constants/ResidencyStoreABI.js";

async function getResidesInUS(req, res) {
  logWithTimestamp("getResidesInUS: Entered");
  if (!req.query.user) {
    logWithTimestamp("getResidesInUS: No user in query params. Exiting");
    return res
      .status(400)
      .json({ error: "Request query params do not include user address" });
  }
  if (!assertValidAddress(req.query.user)) {
    logWithTimestamp("getResidesInUS: Invalid address. Exiting");
    return res.status(400).json({ error: "Invalid user address" });
  }
  const contractAddr = resStoreAddrsByNetwork[req.params.network];
  const provider = providers[req.params.network];
  try {
    const contract = new ethers.Contract(contractAddr, ResidencyStoreABI, provider);
    const isUSResident = await contract.usResidency(req.query.user);
    return res.status(200).json({ result: isUSResident });
  } catch (err) {
    console.log(err);
    logWithTimestamp(
      "getResidesInUS: Encountered error while calling smart contract. Exiting"
    );
    return res.status(500).json({ error: "An unexpected error occured" });
  }
}

async function usResidents(req, res) {
  // TODO: Rewrite this once we modify the contract to include user address (instead
  // of relayer address) in the USResidency event.
  logWithTimestamp("usResidents: Entered");
  const network = req.params.network ?? "optimism";
  const iface = new ethers.utils.Interface(ResidencyStoreABI);
  try {
    const contractAddr = resStoreAddrsByNetwork[network];
    const provider = providers[network];
    const contract = new ethers.Contract(contractAddr, ResidencyStoreABI, provider);
    const usResidencyEvents = await contract.queryFilter("USResidency");
    const addresses = [];
    for (const event of usResidencyEvents) {
      const tx = await provider.getTransaction(event.transactionHash);
      const functionData = iface.decodeFunctionData("prove", tx.data);
      const address = functionData[1][1].toHexString();
      addresses.push(address);
    }
    logWithTimestamp("usResidents: Returning user crypto addresses");
    return res.status(200).json({ result: addresses });
  } catch (err) {
    console.log(err);
    logWithTimestamp(
      "usResidents: Encountered error while getting smart contract events. Exiting"
    );
    return res.status(500).json({ error: "An unexpected error occured" });
  }
}

export { getResidesInUS, usResidents };
