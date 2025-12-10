"use client";

import { useAccount, useDisconnect } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { Lock, Users, Crown, Star, Heart, Sparkles, ArrowRight, User } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="text-white text-shimmer glow-pink">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-10">
      <header className="bg-white/20 backdrop-blur-md border-b-2 border-white/30 shadow-lg relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Lock className="h-8 w-8 text-white sparkle" />
              <h1 className="text-2xl font-bold text-white text-shimmer glow-pink">
                Private Reputation System
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              {isConnected && (
                <>
                  <Link
                    href="/home"
                    className="px-4 py-2 text-sm font-semibold text-white border-2 border-white/50 rounded-md hover:bg-white/20 hover:border-white transition whitespace-nowrap backdrop-blur-sm"
                  >
                    All Profiles
                  </Link>
                  <Link
                    href="/me"
                    className="px-4 py-2 text-sm font-semibold text-white border-2 border-white/50 rounded-md hover:bg-white/20 hover:border-white transition whitespace-nowrap backdrop-blur-sm"
                  >
                    My Profile
                  </Link>
                </>
              )}
              <ConnectKitButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="text-center mb-12 relative">
          {/* Decorative elements */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-32 bg-white/10 rounded-full blur-3xl float"></div>
          </div>
          <Star className="absolute top-0 left-[10%] h-6 w-6 text-white/40 sparkle float" style={{ animationDelay: '0s' }} />
          <Heart className="absolute top-8 right-[15%] h-5 w-5 text-white/50 sparkle float" style={{ animationDelay: '0.5s' }} />
          <Star className="absolute bottom-0 left-[20%] h-4 w-4 text-white/30 sparkle float" style={{ animationDelay: '1s' }} />
          <Heart className="absolute top-16 left-[5%] h-4 w-4 text-white/40 sparkle float" style={{ animationDelay: '1.5s' }} />
          <Star className="absolute bottom-8 right-[10%] h-5 w-5 text-white/50 sparkle float" style={{ animationDelay: '0.8s' }} />
          <Sparkles className="absolute top-4 right-[25%] h-4 w-4 text-white/40 sparkle float" style={{ animationDelay: '1.2s' }} />
          
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-2">
              <Crown className="h-8 w-8 text-white/80 sparkle" />
            </div>
            <h2 className="text-4xl font-extrabold text-white sm:text-5xl text-shimmer glow-pink">
              Reputation with FHE
            </h2>
            <p className="mt-4 text-xl text-white/90">
              Build and manage your reputation privately with Fully Homomorphic Encryption
            </p>
          </div>
        </div>

        {!isConnected && (
          <div className="bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-lg shadow-lg p-8 text-center border-glow-pink relative z-10 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4 glow-pink">
              Connect Your Wallet
            </h3>
            <p className="text-white/90 mb-6">
              Connect your wallet to start building your reputation
            </p>
            <ConnectKitButton />
          </div>
        )}

        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto relative z-10">
            <Link
              href="/home"
              className="bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-lg p-8 hover:bg-white/30 transition border-glow-pink group"
            >
              <div className="flex items-center justify-center mb-4">
                <Users className="h-12 w-12 text-white sparkle" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 glow-pink">
                All Profiles
              </h3>
              <p className="text-white/90 mb-4">
                View all community profiles, leave comments, and vote on profiles
              </p>
              <div className="flex items-center text-white group-hover:text-white/80 transition">
                <span className="font-semibold">Explore Profiles</span>
                <ArrowRight className="h-5 w-5 ml-2" />
              </div>
            </Link>

            <Link
              href="/me"
              className="bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-lg p-8 hover:bg-white/30 transition border-glow-pink group"
            >
              <div className="flex items-center justify-center mb-4">
                <User className="h-12 w-12 text-white sparkle" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 glow-pink">
                My Profile
              </h3>
              <p className="text-white/90 mb-4">
                View and edit your profile, check your statistics and comments
              </p>
              <div className="flex items-center text-white group-hover:text-white/80 transition">
                <span className="font-semibold">Manage Profile</span>
                <ArrowRight className="h-5 w-5 ml-2" />
              </div>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
