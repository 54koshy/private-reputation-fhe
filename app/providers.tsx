"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { useMemo } from "react";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  // Get current URL for WalletConnect metadata (only on client side)
  const appUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_APP_URL || "https://private-reputation-system.netlify.app";
  }, []);

  // Get RPC URL from environment variable
  const rpcUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://sepolia.drpc.org";
  }, []);

  // Create wagmi config from ConnectKit default config
  const wagmiConfig = useMemo(
    () =>
      createConfig(
        getDefaultConfig({
          appName: "Private Reputation System",
          appDescription: "Decentralized Reputation Platform with FHE",
          appUrl: appUrl,
          appIcon: `${appUrl}/icon.png`,
          walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "private-reputation-default",
          chains: [sepolia],
          transports: {
            [sepolia.id]: http(rpcUrl),
          },
        })
      ),
    [appUrl, rpcUrl]
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

