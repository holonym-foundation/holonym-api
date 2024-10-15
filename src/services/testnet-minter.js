import { randomBytes } from "crypto";
import { ethers } from "ethers";
import { v3KYCSybilResistanceCircuitId } from "../constants/misc.js";
import { providers } from "../init.js";

export async function setKycSbt(req, res) {
  try {
    const testnetMinterWallet = new ethers.Wallet(
      process.env.TESTNET_MINTER_PRIVATE_KEY,
      providers["base-sepolia"]
    );

    const { circuitId, sbtReceiver, expiration, nullifier, publicValues } = req.body;

    const abi = [
      "function setSBT(bytes32 circuitId, address sbtReceiver, uint expiration, uint nullifier, uint[] calldata publicValues)",
    ];
    const address = "0x98221c937C51f5bBe615CB104435395c93b1AD8D";
    const contract = new ethers.Contract(address, abi, testnetMinterWallet);

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
