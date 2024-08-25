import * as nearAPI from "near-api-js";

function getNear() {
  const { connect } = nearAPI;

  const connectionConfig = {
    networkId: "mainnet",
    // keyStore: myKeyStore,
    nodeUrl: "https://rpc.mainnet.near.org",
    walletUrl: "https://wallet.mainnet.near.org",
    helperUrl: "https://helper.mainnet.near.org",
    explorerUrl: "https://nearblocks.io",
  };
  return connect(connectionConfig);
}

/**
 * @param {string} user
 * @param {Array<number>} circuitId
 */
export async function viewHubV3Sbt(user, circuitId) {
  const { Contract } = nearAPI;
  const near = await getNear();

  const contract = new Contract(near.connection, "verifier.holonym_id.near", {
    viewMethods: ["get_sbt"],
  });
  return contract.get_sbt({ owner: user, circuit_id: circuitId });
}
