"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { getReputationManagerAddress } from "@/utils/address";
import { useState, useEffect } from "react";

const REPUTATION_MANAGER_ABI = [
  {
    inputs: [
      { name: "_nickname", type: "string" },
      { name: "_twitter", type: "string" },
      { name: "_discord", type: "string" },
      { name: "_description", type: "string" },
      { name: "_avatarHash", type: "string" },
    ],
    name: "createProfile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_nickname", type: "string" },
      { name: "_twitter", type: "string" },
      { name: "_discord", type: "string" },
      { name: "_description", type: "string" },
      { name: "_avatarHash", type: "string" },
    ],
    name: "updateProfile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_profileOwner", type: "address" },
      { name: "_isLike", type: "bool" },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_profileOwner", type: "address" }],
    name: "removeVote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_profileOwner", type: "address" },
      { name: "_content", type: "string" },
    ],
    name: "addComment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_profileOwner", type: "address" },
      { name: "_commentId", type: "uint256" },
    ],
    name: "deleteComment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_owner", type: "address" }],
    name: "getProfile",
    outputs: [
      {
        components: [
          { name: "owner", type: "address" },
          { name: "nickname", type: "string" },
          { name: "twitter", type: "string" },
          { name: "discord", type: "string" },
          { name: "description", type: "string" },
          { name: "avatarHash", type: "string" },
          { name: "createdAt", type: "uint256" },
          { name: "exists", type: "bool" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllProfileOwners",
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_profileOwner", type: "address" }],
    name: "getProfileVotes",
    outputs: [
      {
        components: [
          { name: "voter", type: "address" },
          { name: "isLike", type: "bool" },
          { name: "timestamp", type: "uint256" },
        ],
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
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
  {
    inputs: [],
    name: "totalProfiles",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export interface Profile {
  owner: `0x${string}`;
  nickname: string;
  twitter: string;
  discord: string;
  description: string;
  avatarHash: string;
  createdAt: bigint;
  exists: boolean;
}

export interface Vote {
  voter: `0x${string}`;
  isLike: boolean;
  timestamp: bigint;
}

export interface Comment {
  id: bigint;
  author: `0x${string}`;
  profileOwner: `0x${string}`;
  content: string;
  timestamp: bigint;
  isDeleted: boolean;
}

export function useReputation() {
  const { address } = useAccount();
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // get contract address, use fallback if it fails
  let contractAddress: `0x${string}` | undefined;
  try {
    contractAddress = getReputationManagerAddress();
  } catch (error: any) {
    console.error("failed to get contract address:", error);
    contractAddress = "0x4A688A45Eef0A1EE6C25930Cfee5B988EC5d351B" as `0x${string}`;
  }

  // read total profiles count
  const { data: totalProfiles } = useReadContract({
    address: contractAddress || undefined,
    abi: REPUTATION_MANAGER_ABI,
    functionName: "totalProfiles",
    query: {
      enabled: !!contractAddress,
    },
  });

  // get all profile owners
  const { data: allProfileOwners, refetch: refetchProfileOwners, isLoading: loadingOwners } = useReadContract({
    address: contractAddress || undefined,
    abi: REPUTATION_MANAGER_ABI,
    functionName: "getAllProfileOwners",
    query: {
      enabled: !!contractAddress,
      refetchInterval: 5000, // refresh every 5 seconds
    },
  });

  // normalize the array (sometimes it's not an array for some reason)
  const normalizedProfileOwners = allProfileOwners 
    ? (Array.isArray(allProfileOwners) ? allProfileOwners : [allProfileOwners]).filter(Boolean) as `0x${string}`[]
    : undefined;

  // write to contract
  const { writeContract, data: hash, isPending, isError, error, reset } = useWriteContract();

  // wait for tx confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: hash || undefined,
  });

  useEffect(() => {
    if (hash) {
      setTransactionHash(hash);
    }
  }, [hash]);

  useEffect(() => {
    if (error) {
      console.error("write contract error:", error);
      setIsLoading(false);
    }
  }, [error]);

  const createProfile = (
    nickname: string,
    twitter: string,
    discord: string,
    description: string,
    avatarHash: string
  ) => {
    if (!address) {
      throw new Error("Wallet not connected");
    }
    if (!contractAddress) {
      contractAddress = "0x4A688A45Eef0A1EE6C25930Cfee5B988EC5d351B" as `0x${string}`;
    }
    setIsLoading(true);
    reset();
    writeContract({
      address: contractAddress,
      abi: REPUTATION_MANAGER_ABI,
      functionName: "createProfile",
      args: [nickname, twitter, discord, description, avatarHash],
    });
  };

  const updateProfile = (
    nickname: string,
    twitter: string,
    discord: string,
    description: string,
    avatarHash: string
  ) => {
    if (!address) {
      throw new Error("Wallet not connected");
    }
    if (!contractAddress) {
      contractAddress = "0x4A688A45Eef0A1EE6C25930Cfee5B988EC5d351B" as `0x${string}`;
    }
    setIsLoading(true);
    reset();
    writeContract({
      address: contractAddress,
      abi: REPUTATION_MANAGER_ABI,
      functionName: "updateProfile",
      args: [nickname, twitter, discord, description, avatarHash],
    });
  };

  const vote = (profileOwner: `0x${string}`, isLike: boolean) => {
    if (!address) throw new Error("Wallet not connected");
    if (!contractAddress) {
      contractAddress = "0x4A688A45Eef0A1EE6C25930Cfee5B988EC5d351B" as `0x${string}`;
    }
    setIsLoading(true);
    reset();
    writeContract({
      address: contractAddress,
      abi: REPUTATION_MANAGER_ABI,
      functionName: "vote",
      args: [profileOwner, isLike],
    });
  };

  const removeVote = (profileOwner: `0x${string}`) => {
    if (!address) throw new Error("Wallet not connected");
    if (!contractAddress) {
      contractAddress = "0x4A688A45Eef0A1EE6C25930Cfee5B988EC5d351B" as `0x${string}`;
    }
    setIsLoading(true);
    reset();
    writeContract({
      address: contractAddress,
      abi: REPUTATION_MANAGER_ABI,
      functionName: "removeVote",
      args: [profileOwner],
    });
  };

  const addComment = (profileOwner: `0x${string}`, content: string) => {
    if (!address) throw new Error("Wallet not connected");
    if (!contractAddress) {
      contractAddress = "0x4A688A45Eef0A1EE6C25930Cfee5B988EC5d351B" as `0x${string}`;
    }
    setIsLoading(true);
    reset();
    writeContract({
      address: contractAddress,
      abi: REPUTATION_MANAGER_ABI,
      functionName: "addComment",
      args: [profileOwner, content],
    });
  };

  const deleteComment = (profileOwner: `0x${string}`, commentId: bigint) => {
    if (!address) throw new Error("Wallet not connected");
    if (!contractAddress) {
      contractAddress = "0x4A688A45Eef0A1EE6C25930Cfee5B988EC5d351B" as `0x${string}`;
    }
    setIsLoading(true);
    reset();
    writeContract({
      address: contractAddress,
      abi: REPUTATION_MANAGER_ABI,
      functionName: "deleteComment",
      args: [profileOwner, commentId],
    });
  };

  useEffect(() => {
    if (isSuccess && hash) {
      setTransactionHash(null);
      setIsLoading(false);
      refetchProfileOwners();
    }
  }, [isSuccess, hash, refetchProfileOwners]);

  return {
    createProfile,
    updateProfile,
    vote,
    removeVote,
    addComment,
    deleteComment,
    allProfileOwners: normalizedProfileOwners,
    totalProfiles: totalProfiles as bigint | undefined,
    isLoading: isLoading || isPending || isConfirming || loadingOwners,
    isSuccess,
    isError,
    error,
    contractAddress,
  };
}

