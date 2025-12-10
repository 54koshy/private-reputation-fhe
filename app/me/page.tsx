"use client";

import { useAccount, useDisconnect } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { Lock, ArrowLeft, Edit, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import ProfileForm from "@/components/ProfileForm";
import { useReputation } from "@/hooks/useReputation";
import { generatePixelAvatar } from "@/utils/avatarGenerator";
import Link from "next/link";
import { useVotes } from "@/hooks/useVotes";
import { useComments } from "@/hooks/useComments";

export default function MePage() {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  
  const { profile, isLoading } = useProfile(address);
  const { likes, dislikes } = useVotes(address || "0x0", address);
  const { comments } = useComments(address || "0x0");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug logging
  useEffect(() => {
    console.log("MePage - address:", address);
    console.log("MePage - profile:", profile);
    console.log("MePage - isLoading:", isLoading);
    if (profile) {
      console.log("MePage - profile.exists:", profile.exists);
    }
  }, [address, profile, isLoading]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="text-white text-shimmer glow-pink">Loading...</div>
      </div>
    );
  }

  if (!isConnected) {
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
              <ConnectKitButton />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-lg shadow-lg p-8 text-center border-glow-pink">
            <h3 className="text-2xl font-bold text-white mb-4 glow-pink">
              Connect Your Wallet
            </h3>
            <p className="text-white/90 mb-6">
              Connect your wallet to view and edit your profile
            </p>
            <ConnectKitButton />
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
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
                <Link
                  href="/home"
                  className="px-4 py-2 text-sm font-semibold text-white border-2 border-white/50 rounded-md hover:bg-white/20 hover:border-white transition whitespace-nowrap backdrop-blur-sm"
                >
                  All Profiles
                </Link>
                <ConnectKitButton />
                <button
                  onClick={() => disconnect()}
                  className="px-4 py-2 text-sm font-semibold text-white border-2 border-white/50 rounded-md hover:bg-white/20 hover:border-white transition whitespace-nowrap backdrop-blur-sm"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="text-center text-white/90 py-12">Loading your profile...</div>
        </main>
      </div>
    );
  }

  if (!profile || !profile.exists) {
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
                <Link
                  href="/home"
                  className="px-4 py-2 text-sm font-semibold text-white border-2 border-white/50 rounded-md hover:bg-white/20 hover:border-white transition whitespace-nowrap backdrop-blur-sm"
                >
                  All Profiles
                </Link>
                <ConnectKitButton />
                <button
                  onClick={() => disconnect()}
                  className="px-4 py-2 text-sm font-semibold text-white border-2 border-white/50 rounded-md hover:bg-white/20 hover:border-white transition whitespace-nowrap backdrop-blur-sm"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <Link
            href="/home"
            className="inline-flex items-center space-x-2 text-white/90 hover:text-white mb-6 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to All Profiles</span>
          </Link>

          <div className="bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-lg shadow-lg p-8 text-center border-glow-pink">
            <User className="h-16 w-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4 glow-pink">
              No Profile Yet
            </h3>
            <p className="text-white/90 mb-6">
              Create your profile to start building your reputation
            </p>
            <button
              onClick={() => setShowEditForm(true)}
              className="px-6 py-2 bg-white text-pink-500 rounded-lg hover:bg-white/90 transition font-semibold shadow-lg border-glow-pink"
            >
              Create Profile
            </button>
          </div>
        </main>

        {showEditForm && (
          <ProfileForm
            profile={null}
            onClose={() => setShowEditForm(false)}
            onSuccess={() => setShowEditForm(false)}
          />
        )}
      </div>
    );
  }

  const avatarUrl = generatePixelAvatar(profile.owner);

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
              <Link
                href="/home"
                className="px-4 py-2 text-sm font-semibold text-white border-2 border-white/50 rounded-md hover:bg-white/20 hover:border-white transition whitespace-nowrap backdrop-blur-sm"
              >
                All Profiles
              </Link>
              <ConnectKitButton />
              <button
                onClick={() => disconnect()}
                className="px-4 py-2 text-sm font-semibold text-white border-2 border-white/50 rounded-md hover:bg-white/20 hover:border-white transition whitespace-nowrap backdrop-blur-sm"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <Link
          href="/home"
          className="inline-flex items-center space-x-2 text-white/90 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to All Profiles</span>
        </Link>

        <div className="bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-lg p-8 border-glow-pink">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <img
                  src={avatarUrl}
                  alt={profile.nickname}
                  className="w-32 h-32 rounded-lg border-2 border-white/50"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white glow-pink mb-2">
                  {profile.nickname}
                </h1>
                <p className="text-sm text-white/70 font-mono mb-4">
                  {profile.owner}
                </p>
                {profile.description && (
                  <p className="text-white/90 text-lg mb-4">{profile.description}</p>
                )}
                <div className="flex items-center space-x-6 text-white/80">
                  {profile.twitter && (
                    <a
                      href={`https://twitter.com/${profile.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition"
                    >
                      Twitter: {profile.twitter}
                    </a>
                  )}
                  {profile.discord && (
                    <span>Discord: {profile.discord}</span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowEditForm(true)}
              className="px-4 py-2 bg-white text-pink-500 rounded-lg hover:bg-white/90 transition flex items-center space-x-2 font-semibold shadow-lg border-glow-pink"
            >
              <Edit className="h-5 w-5" />
              <span>Edit Profile</span>
            </button>
          </div>

          <div className="border-t-2 border-white/30 pt-6 mt-6">
            <h2 className="text-xl font-bold text-white mb-4 glow-pink">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                <p className="text-white/70 text-sm mb-1">Likes</p>
                <p className="text-2xl font-bold text-white">{likes.toString()}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                <p className="text-white/70 text-sm mb-1">Dislikes</p>
                <p className="text-2xl font-bold text-white">{dislikes.toString()}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                <p className="text-white/70 text-sm mb-1">Comments</p>
                <p className="text-2xl font-bold text-white">{comments.length}</p>
              </div>
            </div>
          </div>

          {comments.length > 0 && (
            <div className="border-t-2 border-white/30 pt-6 mt-6">
              <h2 className="text-xl font-bold text-white mb-4 glow-pink">Comments</h2>
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div
                    key={comment.id.toString()}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4"
                  >
                    <p className="text-white/90 text-sm font-mono mb-2">
                      {comment.author.slice(0, 6)}...{comment.author.slice(-4)}
                    </p>
                    <p className="text-white">{comment.content}</p>
                    <p className="text-white/60 text-xs mt-2">
                      {new Date(Number(comment.timestamp) * 1000).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {showEditForm && (
        <ProfileForm
          profile={profile}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => setShowEditForm(false)}
        />
      )}
    </div>
  );
}

