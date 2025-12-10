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

  // Always get contract address (with fallback)
  let contractAddress: `0x${string}` | undefined;
  try {
    contractAddress = getReputationManagerAddress();
  } catch (error: any) {
    console.error("Failed to get contract address:", error);
    // Use fallback address directly
    contractAddress = "0x4A688A45Eef0A1EE6C25930Cfee5B988EC5d351B" as `0x${string}`;
  }

  // Read total profiles
  const { data: totalProfiles } = useReadContract({
    address: contractAddress || undefined,
    abi: REPUTATION_MANAGER_ABI,
    functionName: "totalProfiles",
    query: {
      enabled: !!contractAddress,
    },
  });

  // Get all profile owners
  const { data: allProfileOwners, refetch: refetchProfileOwners, isLoading: loadingOwners, error: ownersError } = useReadContract({
    address: contractAddress || undefined,
    abi: REPUTATION_MANAGER_ABI,
    functionName: "getAllProfileOwners",
    query: {
      enabled: !!contractAddress,
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  });

  // Normalize allProfileOwners to ensure it's an array of addresses
  const normalizedProfileOwners = allProfileOwners 
    ? (Array.isArray(allProfileOwners) ? allProfileOwners : [allProfileOwners]).filter(Boolean) as `0x${string}`[]
    : undefined;

  // Debug logging
  useEffect(() => {
    console.log("useReputation - contractAddress:", contractAddress);
    console.log("useReputation - allProfileOwners (raw):", allProfileOwners);
    console.log("useReputation - normalizedProfileOwners:", normalizedProfileOwners);
    console.log("useReputation - totalProfiles:", totalProfiles);
    console.log("useReputation - loadingOwners:", loadingOwners);
    console.log("useReputation - ownersError:", ownersError);
    if (allProfileOwners) {
      console.log("useReputation - allProfileOwners type:", typeof allProfileOwners);
      console.log("useReputation - allProfileOwners is array:", Array.isArray(allProfileOwners));
      if (Array.isArray(allProfileOwners)) {
        console.log("useReputation - allProfileOwners length:", allProfileOwners.length);
        console.log("useReputation - allProfileOwners content:", allProfileOwners);
      }
    }
  }, [contractAddress, allProfileOwners, normalizedProfileOwners, totalProfiles, loadingOwners, ownersError]);

  // Write contract
  const { writeContract, data: hash, isPending, isError, error, reset } = useWriteContract();

  // Wait for transaction
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: hash || undefined,
  });

  useEffect(() => {
    if (hash) {
      setTransactionHash(hash);
      console.log("Transaction hash received:", hash);
      // Keep loading state true until transaction is confirmed
    }
  }, [hash]);

  useEffect(() => {
    if (error) {
      console.error("Write contract error:", error);
      setIsLoading(false);
      // Show error to user
      const errorMessage = error.message || "Transaction failed";
      alert(`Error: ${errorMessage}`);
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
      // Use fallback if still not available
      contractAddress = "0x4A688A45Eef0A1EE6C25930Cfee5B988EC5d351B" as `0x${string}`;
    }
    setIsLoading(true);
    reset();
    try {
      console.log("Creating profile with:", { nickname, twitter, discord, description, avatarHash });
      writeContract({
        address: contractAddress,
        abi: REPUTATION_MANAGER_ABI,
        functionName: "createProfile",
        args: [nickname, twitter, discord, description, avatarHash],
      });
    } catch (err: any) {
      console.error("Error in createProfile:", err);
      setIsLoading(false);
      throw err;
    }
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
    try {
      console.log("Updating profile with:", { nickname, twitter, discord, description, avatarHash });
      writeContract({
        address: contractAddress,
        abi: REPUTATION_MANAGER_ABI,
        functionName: "updateProfile",
        args: [nickname, twitter, discord, description, avatarHash],
      });
    } catch (err: any) {
      console.error("Error in updateProfile:", err);
      setIsLoading(false);
      throw err;
    }
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

