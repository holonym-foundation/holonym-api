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
    mainnet: {
      optimism: "0x6A78dF871291627C5470F7a768745C3ff05741F2",
    },
    testnet: {
      "optimism-goerli": "0x1A5f8D110Fa053543184aF404e344a85f5BC6335",
    },
  },
  SybilResistance: {
    mainnet: {
      optimism: "0x3497556f7D0bF602D4237Ecb8ae92840D09E4f63",
    },
    testnet: {
      "optimism-goerli": "0xBA8a4C5c1f36Dc802d51FEEfF3aa4ef97Dae4B10",
    },
  },
  MerkleTree: {
    mainnet: {
      optimism: "0x56A14Abe1DF94aF0dE78AEF3BD96ae9928D3b415",
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
