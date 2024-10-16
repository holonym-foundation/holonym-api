export default [
  "function balanceOf(address) view returns (uint256)",
  "function getApproved(uint256) view returns (address)",
  "function getIdentifier(address,bytes32) pure returns (bytes32)",
  "function getSBT(address,bytes32) view returns (tuple(uint256,uint256[],bool))",
  "function isApprovedForAll(address,address) view returns (bool)",
  "function name() view returns (string)",
  "function owner() view returns (address)",
  "function ownerOf(uint256) view returns (address)",
  "function renounceOwnership()",
  "function revokeSBT(address,bytes32)",
  "function sbtOwners(bytes32) view returns (uint256, bool)",
  "function setSBT(bytes32 circuitId, address sbtReceiver, uint expiration, uint nullifier, uint[] calldata publicValues)",
  "function supportsInterface(bytes4) view returns (bool)",
  "function symbol() view returns (string)",
  "function tokenURI(uint256) view returns (string)",
  "function transferOwnership(address)",
  "function usedNullifiers(uint256) view returns (bool)",
  "function getSBTByNullifier(uint256 nullifier) view returns (tuple(uint256 expiry, uint256[] publicValues, bool revoked) sbt)",
];
