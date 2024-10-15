import { randomBytes } from "crypto";
import { ethers } from "ethers";
import {
  hubV3TestnetAddress,
  v3KYCSybilResistanceCircuitId,
} from "../constants/misc.js";
import HubV3TestnetABI from "../constants/HubV3TestnetABI.js";
import { providers } from "../init.js";

export async function setKycSbt(req, res) {
  try {
    const testnetMinterWallet = new ethers.Wallet(
      process.env.TESTNET_MINTER_PRIVATE_KEY,
      providers["base-sepolia"]
    );

    const { circuitId, sbtReceiver, expiration, nullifier, publicValues } = req.body;

    const contract = new ethers.Contract(
      hubV3TestnetAddress,
      HubV3TestnetABI,
      testnetMinterWallet
    );

    const tx = await contract.setSBT(
      // circuitId,
      // sbtReceiver,
      // expiration,
      // nullifier,
      // publicValues
      v3KYCSybilResistanceCircuitId,
      sbtReceiver,
      ethers.constants.MaxUint256,
      ethers.BigNumber.from("0x" + randomBytes(31).toString("hex")),
      []
    );

    return res.status(200).json({ TransactionHash: tx.hash });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "An unexpected error occured" });
  }
}
