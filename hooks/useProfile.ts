"use client";

import { useReadContract } from "wagmi";
import { useEffect } from "react";
import { getReputationManagerAddress } from "@/utils/address";
import { Profile } from "./useReputation";

const REPUTATION_MANAGER_ABI = [
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
] as const;

export function useProfile(ownerAddress: `0x${string}` | undefined) {
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
    functionName: "getProfile",
    args: ownerAddress ? [ownerAddress] : undefined,
    query: {
      enabled: !!ownerAddress && !!contractAddress,
    },
  });

  // Debug logging
  useEffect(() => {
    console.log("useProfile - ownerAddress:", ownerAddress);
    console.log("useProfile - contractAddress:", contractAddress);
    console.log("useProfile - data:", data);
    console.log("useProfile - isLoading:", isLoading);
    console.log("useProfile - error:", error);
  }, [ownerAddress, contractAddress, data, isLoading, error]);

  if (!data) {
    return { profile: null, isLoading, error, refetch };
  }

  // Handle both tuple and array formats
  let profileData: [
    `0x${string}`,
    string,
    string,
    string,
    string,
    string,
    bigint,
    boolean
  ];

  const dataAny = data as any;
  
  if (Array.isArray(dataAny) && dataAny.length === 8) {
    // Array format
    profileData = dataAny as [
      `0x${string}`,
      string,
      string,
      string,
      string,
      string,
      bigint,
      boolean
    ];
  } else if (dataAny && typeof dataAny === 'object' && 'owner' in dataAny) {
    // Object/tuple format
    profileData = [
      dataAny.owner,
      dataAny.nickname,
      dataAny.twitter,
      dataAny.discord,
      dataAny.description,
      dataAny.avatarHash,
      dataAny.createdAt,
      dataAny.exists,
    ];
  } else if (Array.isArray(dataAny) && dataAny.length === 1 && typeof dataAny[0] === 'object') {
    // Tuple wrapped in array
    const tuple = dataAny[0];
    profileData = [
      tuple.owner || tuple[0],
      tuple.nickname || tuple[1],
      tuple.twitter || tuple[2],
      tuple.discord || tuple[3],
      tuple.description || tuple[4],
      tuple.avatarHash || tuple[5],
      tuple.createdAt || tuple[6],
      tuple.exists !== undefined ? tuple.exists : tuple[7],
    ];
  } else {
    // Try to parse as array
    profileData = dataAny as [
      `0x${string}`,
      string,
      string,
      string,
      string,
      string,
      bigint,
      boolean
    ];
  }

  const profile: Profile = {
    owner: profileData[0] as `0x${string}`,
    nickname: profileData[1] as string,
    twitter: profileData[2] as string,
    discord: profileData[3] as string,
    description: profileData[4] as string,
    avatarHash: profileData[5] as string,
    createdAt: profileData[6] as bigint,
    exists: profileData[7] as boolean,
  };

  console.log("useProfile - parsed profile:", profile);

  return { profile, isLoading, error, refetch };
}

