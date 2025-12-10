"use client";

import { useAccount, useDisconnect } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { Lock, Users, Crown, Star, Heart, Sparkles, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useReputation } from "@/hooks/useReputation";
import { useProfile } from "@/hooks/useProfile";
import ProfileCard from "@/components/ProfileCard";
import ProfileForm from "@/components/ProfileForm";
import { Profile } from "@/hooks/useReputation";
import Link from "next/link";

export default function HomePage() {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  
  const { allProfileOwners, totalProfiles, isLoading: loadingProfiles } = useReputation();
  const { profile: userProfile } = useProfile(address);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug logging
  useEffect(() => {
    console.log("allProfileOwners:", allProfileOwners);
    console.log("totalProfiles:", totalProfiles);
    console.log("loadingProfiles:", loadingProfiles);
    if (allProfileOwners) {
      console.log("allProfileOwners type:", typeof allProfileOwners);
      console.log("allProfileOwners is array:", Array.isArray(allProfileOwners));
      console.log("allProfileOwners length:", Array.isArray(allProfileOwners) ? allProfileOwners.length : "not array");
    }
  }, [allProfileOwners, totalProfiles, loadingProfiles]);

  useEffect(() => {
    if (isConnected && userProfile && !userProfile.exists) {
      // Auto-open form if user doesn't have profile
      setShowProfileForm(true);
    }
  }, [isConnected, userProfile]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="text-white text-shimmer glow-pink">Loading...</div>
      </div>
    );
  }

  const handleCreateProfile = () => {
    setShowProfileForm(true);
  };

  const handleFormSuccess = () => {
    setShowProfileForm(false);
  };

  return (
    <div className="min-h-screen relative z-10">
      <header className="bg-white/20 backdrop-blur-md border-b-2 border-white/30 shadow-lg relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Lock className="h-8 w-8 text-white sparkle" />
              <Link href="/" className="text-2xl font-bold text-white text-shimmer glow-pink">
                Private Reputation System
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              {isConnected && (
                <Link
                  href="/me"
                  className="px-4 py-2 text-sm font-semibold text-white border-2 border-white/50 rounded-md hover:bg-white/20 hover:border-white transition whitespace-nowrap backdrop-blur-sm"
                >
                  My Profile
                </Link>
              )}
              <ConnectKitButton />
              {isConnected && (
                <button
                  onClick={() => disconnect()}
                  className="px-4 py-2 text-sm font-semibold text-white border-2 border-white/50 rounded-md hover:bg-white/20 hover:border-white transition whitespace-nowrap backdrop-blur-sm"
                >
                  Disconnect
                </button>
              )}
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
              All Profiles
            </h2>
            <p className="mt-4 text-xl text-white/90">
              View and interact with all community profiles
            </p>
          </div>
        </div>

        {!isConnected && (
          <div className="bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-lg shadow-lg p-8 text-center border-glow-pink relative z-10">
            <h3 className="text-2xl font-bold text-white mb-4 glow-pink">
              Connect Your Wallet
            </h3>
            <p className="text-white/90 mb-6">
              Connect your wallet to view and interact with profiles
            </p>
            <ConnectKitButton />
          </div>
        )}

        {isConnected && (
          <>
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="flex items-center space-x-4">
                <Users className="h-6 w-6 text-white sparkle" />
                <div>
                  <h3 className="text-2xl font-bold text-white glow-pink">
                    Community Profiles
                  </h3>
                  <p className="text-white/80 text-sm">
                    {totalProfiles ? `${totalProfiles.toString()} total profiles` : "Loading..."}
                  </p>
                </div>
              </div>
              {(!userProfile || !userProfile.exists) && (
                <button
                  onClick={handleCreateProfile}
                  className="px-4 py-2 bg-white text-pink-500 rounded-lg hover:bg-white/90 transition flex items-center space-x-2 font-semibold shadow-lg border-glow-pink"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create Profile</span>
                </button>
              )}
            </div>

            {loadingProfiles ? (
              <div className="text-center text-white/90 py-12 relative z-10">Loading profiles...</div>
            ) : allProfileOwners && Array.isArray(allProfileOwners) && allProfileOwners.length > 0 ? (
              <div className="space-y-6 relative z-10">
                {allProfileOwners.map((ownerAddress: `0x${string}`) => (
                  <ProfileCard
                    key={ownerAddress}
                    ownerAddress={ownerAddress}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-lg p-8 text-center border-glow-pink relative z-10">
                <p className="text-white/90 mb-4">No profiles yet. Be the first to create one!</p>
                <button
                  onClick={handleCreateProfile}
                  className="px-6 py-2 bg-white text-pink-500 rounded-lg hover:bg-white/90 transition font-semibold shadow-lg border-glow-pink"
                >
                  Create Profile
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {showProfileForm && (
        <ProfileForm
          profile={null}
          onClose={() => {
            setShowProfileForm(false);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}

