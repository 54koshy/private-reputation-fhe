"use client";

import { useAccount } from "wagmi";
import { useProfile } from "@/hooks/useProfile";
import { useVotes } from "@/hooks/useVotes";
import { useComments } from "@/hooks/useComments";
import { useReputation } from "@/hooks/useReputation";
import { generatePixelAvatar } from "@/utils/avatarGenerator";
import { ThumbsUp, ThumbsDown, MessageCircle, Edit, Twitter, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { Profile } from "@/hooks/useReputation";

interface ProfileCardProps {
  ownerAddress: `0x${string}`;
  onEdit?: (profile: Profile) => void;
}

export default function ProfileCard({ ownerAddress, onEdit }: ProfileCardProps) {
  const { address } = useAccount();
  const { profile, isLoading } = useProfile(ownerAddress);
  const { likes, dislikes, hasVoted } = useVotes(ownerAddress, address);
  const { comments } = useComments(ownerAddress);
  const { vote, removeVote, addComment, deleteComment, isLoading: isActionLoading } = useReputation();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showCommentForm, setShowCommentForm] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log("ProfileCard - ownerAddress:", ownerAddress);
    console.log("ProfileCard - profile:", profile);
    console.log("ProfileCard - isLoading:", isLoading);
  }, [ownerAddress, profile, isLoading]);

  if (isLoading) {
    return (
      <div className="bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-lg p-6 border-glow-pink">
        <div className="text-white/90">Loading profile...</div>
      </div>
    );
  }

  if (!profile || !profile.exists) {
    return null;
  }

  const avatarUrl = profile.avatarHash 
    ? generatePixelAvatar(profile.owner)
    : generatePixelAvatar(profile.owner);

  const handleVote = async (isLike: boolean) => {
    if (!address || address === ownerAddress) return;
    try {
      if (hasVoted) {
        await removeVote(ownerAddress);
        // Wait a bit then vote again
        setTimeout(() => {
          vote(ownerAddress, isLike);
        }, 1000);
      } else {
        vote(ownerAddress, isLike);
      }
    } catch (error: any) {
      console.error("Error voting:", error);
      alert(`Error: ${error.message || "Failed to vote"}`);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      await addComment(ownerAddress, commentText);
      setCommentText("");
      setShowCommentForm(false);
    } catch (error: any) {
      console.error("Error adding comment:", error);
      alert(`Error: ${error.message || "Failed to add comment"}`);
    }
  };

  const handleDeleteComment = async (commentId: bigint) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteComment(ownerAddress, commentId);
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      alert(`Error: ${error.message || "Failed to delete comment"}`);
    }
  };

  return (
    <div className="bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-lg p-6 border-glow-pink">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <img
            src={avatarUrl}
            alt={profile.nickname}
            className="w-20 h-20 rounded-lg border-2 border-white/50"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-white glow-pink">{profile.nickname}</h3>
              <p className="text-sm text-white/70 font-mono mt-1 truncate">
                {ownerAddress}
              </p>
            </div>
            {onEdit && address === ownerAddress && (
              <button
                onClick={() => onEdit(profile)}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition"
              >
                <Edit className="h-5 w-5" />
              </button>
            )}
          </div>

          {(profile.twitter || profile.discord) && (
            <div className="flex items-center space-x-4 mt-2">
              {profile.twitter && (
                <a
                  href={`https://twitter.com/${profile.twitter.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-white/90 hover:text-white transition"
                >
                  <Twitter className="h-4 w-4" />
                  <span className="text-sm">{profile.twitter}</span>
                </a>
              )}
              {profile.discord && (
                <div className="flex items-center space-x-1 text-white/90">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">{profile.discord}</span>
                </div>
              )}
            </div>
          )}

          {profile.description && (
            <p className="text-white/90 mt-3">{profile.description}</p>
          )}

          <div className="flex items-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleVote(true)}
                disabled={isActionLoading || !address || address === ownerAddress}
                className={`p-2 rounded-lg transition ${
                  hasVoted
                    ? "bg-white/20 text-white"
                    : "text-white/90 hover:bg-white/20"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <ThumbsUp className="h-5 w-5" />
              </button>
              <span className="text-white font-semibold">{likes.toString()}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleVote(false)}
                disabled={isActionLoading || !address || address === ownerAddress}
                className={`p-2 rounded-lg transition ${
                  hasVoted
                    ? "bg-white/20 text-white"
                    : "text-white/90 hover:bg-white/20"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <ThumbsDown className="h-5 w-5" />
              </button>
              <span className="text-white font-semibold">{dislikes.toString()}</span>
            </div>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-white/90 hover:text-white transition"
            >
              <MessageCircle className="h-5 w-5" />
              <span>{comments.length}</span>
            </button>
          </div>

          {showComments && (
            <div className="mt-4 border-t-2 border-white/30 pt-4">
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div
                    key={comment.id.toString()}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white/90 text-sm font-mono mb-1">
                          {comment.author.slice(0, 6)}...{comment.author.slice(-4)}
                        </p>
                        <p className="text-white">{comment.content}</p>
                        <p className="text-white/60 text-xs mt-1">
                          {new Date(Number(comment.timestamp) * 1000).toLocaleString()}
                        </p>
                      </div>
                      {address === comment.author && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-300 hover:text-red-200 text-sm"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {address && address !== ownerAddress && (
                <div className="mt-4">
                  {!showCommentForm ? (
                    <button
                      onClick={() => setShowCommentForm(true)}
                      className="text-white hover:text-white/80 text-sm"
                    >
                      Add comment
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-lg p-2 text-white placeholder-white/50"
                        placeholder="Write a comment..."
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleAddComment}
                          disabled={isActionLoading || !commentText.trim()}
                          className="px-4 py-2 bg-white text-pink-500 rounded-lg hover:bg-white/90 transition disabled:opacity-50 font-semibold shadow-lg"
                        >
                          Post
                        </button>
                        <button
                          onClick={() => {
                            setShowCommentForm(false);
                            setCommentText("");
                          }}
                          className="px-4 py-2 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-lg hover:bg-white/20 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

