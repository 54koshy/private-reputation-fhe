import { getAddress } from "viem";

// Fallback address if env var is not available
const FALLBACK_ADDRESS = "0x4A688A45Eef0A1EE6C25930Cfee5B988EC5d351B";

export function getReputationManagerAddress(): `0x${string}` {
  // Try to get from environment variable first
  let address = process.env.NEXT_PUBLIC_REPUTATION_MANAGER_ADDRESS;
  
  // If not available, use fallback
  if (!address) {
    console.warn("NEXT_PUBLIC_REPUTATION_MANAGER_ADDRESS not found, using fallback address");
    address = FALLBACK_ADDRESS;
  }
  
  if (!address || !address.startsWith("0x")) {
    throw new Error("Contract address must start with 0x");
  }
  
  // Convert to checksum address format
  try {
    return getAddress(address);
  } catch (error) {
    throw new Error(`Invalid contract address: ${address}`);
  }
}

