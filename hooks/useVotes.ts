"use client";

import { useReadContract } from "wagmi";
import { getReputationManagerAddress } from "@/utils/address";

const REPUTATION_MANAGER_ABI = [
  {
    inputs: [{ name: "_profileOwner", type: "address" }],
    name: "getVoteCounts",
    outputs: [
      { name: "likes", type: "uint256" },
      { name: "dislikes", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "_profileOwner", type: "address" },
      { name: "_voter", type: "address" },
    ],
    name: "hasUserVoted",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export function useVotes(profileOwner: `0x${string}` | undefined, voter: `0x${string}` | undefined) {
  // Always get contract address (with fallback)
  let contractAddress: `0x${string}` | undefined;
  try {
    contractAddress = getReputationManagerAddress();
  } catch (error) {
    console.error("Failed to get contract address:", error);
    // Use fallback address directly
    contractAddress = "0x4A688A45Eef0A1EE6C25930Cfee5B988EC5d351B" as `0x${string}`;
  }

  const { data: voteCounts, isLoading: loadingCounts } = useReadContract({
    address: contractAddress || undefined,
    abi: REPUTATION_MANAGER_ABI,
    functionName: "getVoteCounts",
    args: profileOwner ? [profileOwner] : undefined,
    query: {
      enabled: !!profileOwner && !!contractAddress,
    },
  });

  const { data: hasVoted, isLoading: loadingVoted } = useReadContract({
    address: contractAddress || undefined,
    abi: REPUTATION_MANAGER_ABI,
    functionName: "hasUserVoted",
    args: profileOwner && voter ? [profileOwner, voter] : undefined,
    query: {
      enabled: !!profileOwner && !!voter && !!contractAddress,
    },
  });

  return {
    likes: voteCounts ? (voteCounts[0] as bigint) : BigInt(0),
    dislikes: voteCounts ? (voteCounts[1] as bigint) : BigInt(0),
    hasVoted: hasVoted as boolean | undefined,
    isLoading: loadingCounts || loadingVoted,
  };
}

