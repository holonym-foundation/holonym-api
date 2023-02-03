const addrsByNameNetTypeNetwork = {
  // old
  // "optimistic-goerli": {
  //   ResidencyStore: "0x42D6007317CED2281a64aCc052cE57e3d92bf912",
  //   AntiSybilStore: "0xFcA7AC96b1F8A2b8b64C6f08e993D6A85031333e",
  //   Hub: "0x6A78dF871291627C5470F7a768745C3ff05741F2",
  //   MerkleTree: "0xa4f7a6E560aE140CD295bf73737eaBf147e4c92D",
  // },
  Hub: {
    mainnet: {
      optimism: "0x87b6e03b0D57771940D7cC9E92531B6217364B3E",
    },
    testnet: {
      "optimism-goerli": "0x3De3A402E7dD76A03158312115d78a7174443d54",
    },
  },
  IsUSResident: {
    // v1
    // mainnet: {
    //   optimism: "0x6A78dF871291627C5470F7a768745C3ff05741F2",
    // },
    // testnet: {
    //   "optimism-goerli": "0xa6e547FD04C2457Fc37354A9e751aAE4d63949cC",
    // },
    // v2
    mainnet: {
      optimism: "0x7497636F5E657e1E7Ea2e851cDc8649487dF3aab",
    },
    testnet: {
      "optimism-goerli": "0xDDDe70439c4C147BF630c8e63aFE5119B630cf64",
    },
  },
  SybilResistance: {
    // v1
    // mainnet: {
    //   optimism: "0x3497556f7D0bF602D4237Ecb8ae92840D09E4f63",
    // },
    // testnet: {
    //   "optimism-goerli": "0x2A817705E2c42Ae320f84AE5F799fdd7044e6B41",
    // },
    // v2
    mainnet: {
      optimism: "0xdD748977BAb5782625AF1466F4C5F02Eb92Fce31",
    },
    testnet: {
      "optimism-goerli": "0x990e6E35432290b3729B659c9ff9748e97F55785",
    },
  },
  MerkleTree: {
    mainnet: {
      optimism: "0xE848Ce0b3cF9B55F05d47DD832B8c1193Ad2D970",
    },
    testnet: {
      "optimism-goerli": "0xF5b00c8681c2B0a5966b2C99dA8FE725e7b90F63",
    },
  },
};

const hubAddrsByNetwork = {
  ...addrsByNameNetTypeNetwork.Hub.mainnet,
  ...addrsByNameNetTypeNetwork.Hub.testnet,
};

const resStoreAddrsByNetwork = {
  ...addrsByNameNetTypeNetwork.IsUSResident.mainnet,
  ...addrsByNameNetTypeNetwork.IsUSResident.testnet,
};

const sybilResistanceAddrsByNetwork = {
  ...addrsByNameNetTypeNetwork.SybilResistance.mainnet,
  ...addrsByNameNetTypeNetwork.SybilResistance.testnet,
};

const treeAddrsByNetwork = {
  ...addrsByNameNetTypeNetwork.MerkleTree.mainnet,
  ...addrsByNameNetTypeNetwork.MerkleTree.testnet,
};

export default addrsByNameNetTypeNetwork;
export {
  hubAddrsByNetwork,
  resStoreAddrsByNetwork,
  sybilResistanceAddrsByNetwork,
  treeAddrsByNetwork,
};
