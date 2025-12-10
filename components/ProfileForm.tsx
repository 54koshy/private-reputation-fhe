"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useReputation } from "@/hooks/useReputation";
import { generatePixelAvatar, generateAvatarHash } from "@/utils/avatarGenerator";
import { Profile } from "@/hooks/useReputation";
import { X } from "lucide-react";

interface ProfileFormProps {
  profile?: Profile | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProfileForm({ profile, onClose, onSuccess }: ProfileFormProps) {
  const { address } = useAccount();
  const { createProfile, updateProfile, isLoading, isSuccess, error } = useReputation();
  const [formData, setFormData] = useState({
    nickname: "",
    twitter: "",
    discord: "",
    description: "",
  });
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (profile) {
      setFormData({
        nickname: profile.nickname,
        twitter: profile.twitter,
        discord: profile.discord,
        description: profile.description,
      });
      setAvatarUrl(generatePixelAvatar(profile.owner));
    } else if (address) {
      // Generate new avatar for new profile using user's address
      setAvatarUrl(generatePixelAvatar(address));
    }
  }, [profile, address]);

  useEffect(() => {
    if (isSuccess) {
      console.log("Profile created/updated successfully!");
      onSuccess();
      onClose();
    }
  }, [isSuccess, onSuccess, onClose]);

  useEffect(() => {
    if (error) {
      console.error("Transaction error:", error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nickname.trim()) {
      alert("Nickname is required");
      return;
    }

    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      const ownerAddress = profile?.owner || address;
      if (!ownerAddress) {
        throw new Error("Wallet not connected");
      }
      const avatarHash = profile?.avatarHash || generateAvatarHash(ownerAddress);
      
      if (profile) {
        updateProfile(
          formData.nickname,
          formData.twitter,
          formData.discord,
          formData.description,
          avatarHash
        );
      } else {
        createProfile(
          formData.nickname,
          formData.twitter,
          formData.discord,
          formData.description,
          avatarHash
        );
      }
      // Note: The form will close automatically when isSuccess becomes true
      // via the useEffect hook
    } catch (error: any) {
      console.error("Error saving profile:", error);
      alert(`Error: ${error.message || "Failed to save profile"}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-glow-pink">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white glow-pink text-shimmer">
            {profile ? "Edit Profile" : "Create Profile"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-white/80"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-24 h-24 rounded-lg border-2 border-white/50"
          />
          <div>
            <p className="text-white text-sm">Pixel Avatar</p>
            <p className="text-white/60 text-xs">Generated automatically</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Nickname *
            </label>
            <input
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-lg text-white placeholder-white/50"
              placeholder="Enter your nickname"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Twitter (optional)
            </label>
            <input
              type="text"
              value={formData.twitter}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-lg text-white placeholder-white/50"
              placeholder="@username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Discord (optional)
            </label>
            <input
              type="text"
              value={formData.discord}
              onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-lg text-white placeholder-white/50"
              placeholder="username#1234"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Description (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-lg text-white placeholder-white/50"
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-white text-pink-500 rounded-lg hover:bg-white/90 transition disabled:opacity-50 font-semibold shadow-lg border-glow-pink"
            >
              {isLoading ? "Waiting for confirmation..." : profile ? "Update" : "Create"}
            </button>
            {isLoading && (
              <p className="text-white/80 text-sm mt-2">
                Please confirm the transaction in your wallet
              </p>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-lg hover:bg-white/20 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

