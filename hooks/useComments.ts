"use client";

import { useReadContract } from "wagmi";
import { getReputationManagerAddress } from "@/utils/address";
import { Comment } from "./useReputation";

const REPUTATION_MANAGER_ABI = [
  {
    inputs: [{ name: "_profileOwner", type: "address" }],
    name: "getProfileComments",
    outputs: [
      {
        components: [
          { name: "id", type: "uint256" },
          { name: "author", type: "address" },
          { name: "profileOwner", type: "address" },
          { name: "content", type: "string" },
          { name: "timestamp", type: "uint256" },
          { name: "isDeleted", type: "bool" },
        ],
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export function useComments(profileOwner: `0x${string}` | undefined) {
  // Always get contract address (with fallback)
  let contractAddress: `0x${string}` | undefined;
  try {
    contractAddress = getReputationManagerAddress();
  } catch (error) {
    console.error("Failed to get contract address:", error);
    // Use fallback address directly
    contractAddress = "0x4A688A45Eef0A1EE6C25930Cfee5B988EC5d351B" as `0x${string}`;
  }

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress || undefined,
    abi: REPUTATION_MANAGER_ABI,
    functionName: "getProfileComments",
    args: profileOwner ? [profileOwner] : undefined,
    query: {
      enabled: !!profileOwner && !!contractAddress,
    },
  });

  if (!data) {
    return { comments: [], isLoading, error, refetch };
  }

  const comments: Comment[] = (data as any[]).map((item) => ({
    id: item[0] as bigint,
    author: item[1] as `0x${string}`,
    profileOwner: item[2] as `0x${string}`,
    content: item[3] as string,
    timestamp: item[4] as bigint,
    isDeleted: item[5] as boolean,
  })).filter((comment) => !comment.isDeleted);

  return { comments, isLoading, error, refetch };
}

