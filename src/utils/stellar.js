import {
  Horizon,
  rpc,
  TransactionBuilder,
  Networks,
  Contract,
  scValToNative,
  nativeToScVal,
} from "@stellar/stellar-sdk";

import {
  horizonServerUrl,
  sorobanRpcUrl,
  stellarSBTContractAddress,
} from "../constants/misc.js";

/**
 * @typedef {Object} StellarSbt
 * @property {bigint} action_nullifier
 * @property {bigint} circuit_id
 * @property {bigint} expiry
 * @property {bigint} id
 * @property {string} minter - Stellar address
 * @property {Array<bigint>} public_values
 * @property {string} recipient - Stellar address
 * @property {boolean} revoked
 */

/**
 * @typedef {Object} StellarSbtResult
 * @property {StellarSbt} [sbt]
 * @property {'valid' | 'expired' | 'none'} status
 */

async function pollHorizonForTx(txHash) {
  const horizonServer = new Horizon.Server(horizonServerUrl);
  let tx = null;

  let latestErr = null;

  for (let i = 0; i < 5; i++) {
    try {
      tx = await horizonServer.transactions().transaction(txHash).call();
    } catch (err) {
      // console.log('error polling for Stellar transaction', err)
      latestErr = err;
    }

    if (tx?.successful) break;

    await new Promise((r) => setTimeout(r, 3000));
  }

  if (!tx) {
    if (latestErr) throw latestErr;
    else throw new Error(`Failed to retrieve Stellar transaction "${txHash}"`);
  }

  return tx;
}

/**
 * @param {string} address
 * @param {string} circuitId
 * @returns {Promise<StellarSbtResult>}
 */
async function getStellarSBTByAddress(
  address,
  circuitId
  // ): Promise<GetStellarSBTRetVal | null> {
) {
  const networkPassphrase = Networks.PUBLIC;
  const sorobanServer = new rpc.Server(sorobanRpcUrl);
  const userAccount = await sorobanServer.getAccount(address);
  const contract = new Contract(stellarSBTContractAddress);

  const operation = contract.call(
    "get_sbt",
    nativeToScVal(address, { type: "address" }),
    nativeToScVal(circuitId, { type: "u256" })
  );

  const transaction = new TransactionBuilder(userAccount, {
    networkPassphrase,
    fee: "100",
  })
    .addOperation(operation)
    .setTimeout(60)
    .build();

  const simulationResponse = await sorobanServer.simulateTransaction(transaction);
  const parsed = rpc.parseRawSimulation(simulationResponse);

  if (rpc.Api.isSimulationSuccess(simulationResponse)) {
    if (!parsed.result) {
      throw new Error(
        'Unexpected: Could not get "result" field from parsed Stellar transaction simulation for SBT query'
      );
    }

    const sbt = scValToNative(parsed.result?.retval);

    return {
      sbt,
      status: "valid",
    };
  } else if (rpc.Api.isSimulationError(simulationResponse)) {
    // Error code 1 is "SBT not found"
    if (parsed.error.includes("HostError: Error(Contract, #1)")) {
      return { status: "none" };
    }

    // Error code 5 is "SBT revoked"
    // if (parsed.error.includes('HostError: Error(Contract, #5)')) {
    //   return { status: 'revoked' }
    // }

    // Error code 6 is "SBT expired"
    if (parsed.error.includes("HostError: Error(Contract, #6)")) {
      return { status: "expired" };
    }

    throw new Error(
      `Stellar transaction simulation for SBT query failed: ${parsed.error}`
    );
  } else {
    throw new Error(
      "Unexpected: Stellar transaction simulation for SBT query returned an unexpected response"
    );
  }
}

export { getStellarSBTByAddress };
