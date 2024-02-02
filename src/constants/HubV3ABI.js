export default [
  "constructor(address)",
  "event Approval(address indexed,address indexed,uint256 indexed)",
  "event ApprovalForAll(address indexed,address indexed,bool)",
  "event OwnershipTransferred(address indexed,address indexed)",
  "event Transfer(address indexed,address indexed,uint256 indexed)",
  "function approve(address,uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function changeVerifier(address)",
  "function collectFees()",
  "function fees(bytes32) view returns (uint256)",
  "function getApproved(uint256) view returns (address)",
  "function getIdentifier(address,bytes32) pure returns (bytes32)",
  "function getSBT(address,bytes32) view returns (tuple(uint256,uint256[],bool))",
  "function isApprovedForAll(address,address) view returns (bool)",
  "function name() view returns (string)",
  "function owner() view returns (address)",
  "function ownerOf(uint256) view returns (address)",
  "function renounceOwnership()",
  "function revokeSBT(address,bytes32)",
  "function safeTransferFrom(address,address,uint256)",
  "function safeTransferFrom(address,address,uint256,bytes)",
  "function sbtOwners(bytes32) view returns (uint256, bool)",
  "function setSBT(bytes32,uint256,uint256,uint256,uint256,uint256[],bytes) payable",
  "function setApprovalForAll(address,bool)",
  "function setFee(bytes32,uint256)",
  "function supportsInterface(bytes4) view returns (bool)",
  "function symbol() view returns (string)",
  "function tokenURI(uint256) view returns (string)",
  "function transferFrom(address,address,uint256)",
  "function transferOwnership(address)",
  "function usedNullifiers(uint256) view returns (bool)",
];
