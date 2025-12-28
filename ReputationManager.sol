// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract ReputationManager is ZamaEthereumConfig {
    struct Profile {
        address owner;
        string nickname;
        string twitter;
        string discord;
        string description;
        string avatarHash; // Hash of pixel avatar data
        uint256 createdAt;
        bool exists;
    }

    struct Comment {
        uint256 id;
        address author;
        address profileOwner;
        euint32 encryptedContent; // Encrypted comment content with ACL support
        uint256 timestamp;
        bool isDeleted;
    }

    struct Vote {
        address voter;
        bool isLike; // true = like, false = dislike
        uint256 timestamp;
    }

    mapping(address => Profile) public profiles;
    address[] public profileOwnersList; // List of all profile owners
    mapping(address => Vote[]) public profileVotes; // profileOwner => votes
    mapping(address => mapping(address => bool)) public hasVoted; // profileOwner => voter => hasVoted
    mapping(address => Comment[]) public profileComments; // profileOwner => comments
    mapping(address => mapping(uint256 => bool)) public commentDeleted; // profileOwner => commentId => isDeleted

    uint256 private _commentIdCounter;
    uint256 public totalProfiles;

    event ProfileCreated(address indexed owner, string nickname);
    event ProfileUpdated(address indexed owner, string nickname);
    event VoteCast(address indexed profileOwner, address indexed voter, bool isLike);
    event VoteRemoved(address indexed profileOwner, address indexed voter);
    event CommentAdded(address indexed profileOwner, address indexed author, uint256 commentId);
    event CommentDeleted(address indexed profileOwner, uint256 commentId);

    function createProfile(
        string memory _nickname,
        string memory _twitter,
        string memory _discord,
        string memory _description,
        string memory _avatarHash
    ) external {
        require(!profiles[msg.sender].exists, "Profile already exists");
        require(bytes(_nickname).length > 0, "Nickname cannot be empty");

        profiles[msg.sender] = Profile({
            owner: msg.sender,
            nickname: _nickname,
            twitter: _twitter,
            discord: _discord,
            description: _description,
            avatarHash: _avatarHash,
            createdAt: block.timestamp,
            exists: true
        });

        profileOwnersList.push(msg.sender);
        totalProfiles++;

        emit ProfileCreated(msg.sender, _nickname);
    }

    function updateProfile(
        string memory _nickname,
        string memory _twitter,
        string memory _discord,
        string memory _description,
        string memory _avatarHash
    ) external {
        require(profiles[msg.sender].exists, "Profile does not exist");
        require(bytes(_nickname).length > 0, "Nickname cannot be empty");

        profiles[msg.sender].nickname = _nickname;
        profiles[msg.sender].twitter = _twitter;
        profiles[msg.sender].discord = _discord;
        profiles[msg.sender].description = _description;
        profiles[msg.sender].avatarHash = _avatarHash;

        emit ProfileUpdated(msg.sender, _nickname);
    }

    function vote(address _profileOwner, bool _isLike) external {
        require(profiles[_profileOwner].exists, "Profile does not exist");
        require(_profileOwner != msg.sender, "Cannot vote on your own profile");
        require(!hasVoted[_profileOwner][msg.sender], "Already voted");

        Vote memory newVote = Vote({
            voter: msg.sender,
            isLike: _isLike,
            timestamp: block.timestamp
        });

        profileVotes[_profileOwner].push(newVote);
        hasVoted[_profileOwner][msg.sender] = true;

        emit VoteCast(_profileOwner, msg.sender, _isLike);
    }

    function removeVote(address _profileOwner) external {
        require(hasVoted[_profileOwner][msg.sender], "No vote to remove");

        // Mark as not voted
        hasVoted[_profileOwner][msg.sender] = false;

        // Remove vote from array (set to zero address as marker)
        Vote[] storage votes = profileVotes[_profileOwner];
        for (uint256 i = 0; i < votes.length; i++) {
            if (votes[i].voter == msg.sender) {
                votes[i].voter = address(0);
                break;
            }
        }

        emit VoteRemoved(_profileOwner, msg.sender);
    }

    function addComment(
        address _profileOwner,
        externalEuint32 encryptedContent,
        bytes calldata inputProof
    ) external {
        require(profiles[_profileOwner].exists, "Profile does not exist");

        uint256 commentId = _commentIdCounter++;
        
        // Convert external encrypted value to euint32 and set ACL
        euint32 content = FHE.fromExternal(encryptedContent, inputProof);
        FHE.allow(content, msg.sender);
        
        Comment memory newComment = Comment({
            id: commentId,
            author: msg.sender,
            profileOwner: _profileOwner,
            encryptedContent: content,
            timestamp: block.timestamp,
            isDeleted: false
        });

        profileComments[_profileOwner].push(newComment);

        emit CommentAdded(_profileOwner, msg.sender, commentId);
    }

    function deleteComment(address _profileOwner, uint256 _commentId) external {
        Comment[] storage comments = profileComments[_profileOwner];
        for (uint256 i = 0; i < comments.length; i++) {
            if (comments[i].id == _commentId) {
                require(comments[i].author == msg.sender, "Not the comment author");
                comments[i].isDeleted = true;
                commentDeleted[_profileOwner][_commentId] = true;
                emit CommentDeleted(_profileOwner, _commentId);
                return;
            }
        }
        revert("Comment not found");
    }

    function getProfile(address _owner) external view returns (Profile memory) {
        return profiles[_owner];
    }

    function getAllProfileOwners() external view returns (address[] memory) {
        return profileOwnersList;
    }

    function getProfileVotes(address _profileOwner) external view returns (Vote[] memory) {
        return profileVotes[_profileOwner];
    }

    function getProfileComments(address _profileOwner) external view returns (Comment[] memory) {
        return profileComments[_profileOwner];
    }

    function getVoteCounts(address _profileOwner) external view returns (uint256 likes, uint256 dislikes) {
        Vote[] memory votes = profileVotes[_profileOwner];
        for (uint256 i = 0; i < votes.length; i++) {
            if (votes[i].voter != address(0)) {
                if (votes[i].isLike) {
                    likes++;
                } else {
                    dislikes++;
                }
            }
        }
    }

    function hasUserVoted(address _profileOwner, address _voter) external view returns (bool) {
        return hasVoted[_profileOwner][_voter];
    }
}

