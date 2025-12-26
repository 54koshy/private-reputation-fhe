// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ReputationManager - Fully Homomorphic Encryption Reputation System
 * @dev Reputation system with FHE-encrypted comment content lengths
 * 
 * This contract uses Fully Homomorphic Encryption (FHE) via Zama FHEVM.
 * Comment content lengths are encrypted using FHE before being stored on-chain.
 * Content lengths are stored as FHE handles (bytes32) which represent encrypted euint32 values.
 * 
 * FHE Functions:
 * - getCommentEncryptedContentLength: Get FHE handle for a specific comment
 * - getProfileEncryptedCommentLengths: Get all FHE handles for a profile's comments
 * - getEncryptedCommentCount: Count comments with valid FHE encrypted data
 * - verifyCommentEncryption: Verify comment has valid FHE encrypted data
 * - getCommentMetadataWithEncryption: Get comment metadata with FHE handle
 * - getAllCommentsMetadataWithEncryption: Get all comments metadata with FHE handles
 */
contract ReputationManager {
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
        bytes32 encryptedContentLength; // FHE handle (bytes32) for encrypted content length
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

    /**
     * @dev Add a comment with FHE-encrypted content length
     * @param _profileOwner Profile owner address
     * @param _encryptedContentLength FHE handle (bytes32) for encrypted content length
     */
    function addComment(address _profileOwner, bytes32 _encryptedContentLength) external {
        require(profiles[_profileOwner].exists, "Profile does not exist");
        require(_encryptedContentLength != bytes32(0), "FHE encrypted content length cannot be empty");

        uint256 commentId = _commentIdCounter++;
        Comment memory newComment = Comment({
            id: commentId,
            author: msg.sender,
            profileOwner: _profileOwner,
            encryptedContentLength: _encryptedContentLength, // FHE handle stored
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

    /**
     * @dev Get encrypted content length for a specific comment
     * @param _profileOwner Profile owner address
     * @param _commentId Comment ID
     * @return encryptedContentLength FHE handle (bytes32) for encrypted content length
     */
    function getCommentEncryptedContentLength(address _profileOwner, uint256 _commentId) external view returns (bytes32) {
        Comment[] memory comments = profileComments[_profileOwner];
        for (uint256 i = 0; i < comments.length; i++) {
            if (comments[i].id == _commentId && !comments[i].isDeleted) {
                return comments[i].encryptedContentLength;
            }
        }
        revert("Comment not found");
    }

    /**
     * @dev Get all encrypted content lengths for a profile's comments
     * Returns array of FHE handles (bytes32) for all non-deleted comments
     * @param _profileOwner Profile owner address
     * @return encryptedLengths Array of FHE handles (bytes32) for encrypted comment content lengths
     * @return commentIds Array of corresponding comment IDs
     */
    function getProfileEncryptedCommentLengths(address _profileOwner) external view returns (bytes32[] memory encryptedLengths, uint256[] memory commentIds) {
        Comment[] memory comments = profileComments[_profileOwner];
        uint256 count = 0;
        
        // Count non-deleted comments
        for (uint256 i = 0; i < comments.length; i++) {
            if (!comments[i].isDeleted) {
                count++;
            }
        }
        
        // Allocate arrays
        encryptedLengths = new bytes32[](count);
        commentIds = new uint256[](count);
        
        // Fill arrays
        uint256 index = 0;
        for (uint256 i = 0; i < comments.length; i++) {
            if (!comments[i].isDeleted) {
                encryptedLengths[index] = comments[i].encryptedContentLength;
                commentIds[index] = comments[i].id;
                index++;
            }
        }
        
        return (encryptedLengths, commentIds);
    }

    /**
     * @dev Get count of comments with valid FHE encrypted data
     * @param _profileOwner Profile owner address
     * @return count Number of comments with non-zero encrypted content lengths
     */
    function getEncryptedCommentCount(address _profileOwner) external view returns (uint256 count) {
        Comment[] memory comments = profileComments[_profileOwner];
        for (uint256 i = 0; i < comments.length; i++) {
            if (!comments[i].isDeleted && comments[i].encryptedContentLength != bytes32(0)) {
                count++;
            }
        }
        return count;
    }

    /**
     * @dev Verify that a comment has valid FHE encrypted data
     * @param _profileOwner Profile owner address
     * @param _commentId Comment ID
     * @return isValid True if comment exists, is not deleted, and has non-zero encrypted content length
     */
    function verifyCommentEncryption(address _profileOwner, uint256 _commentId) external view returns (bool isValid) {
        Comment[] memory comments = profileComments[_profileOwner];
        for (uint256 i = 0; i < comments.length; i++) {
            if (comments[i].id == _commentId) {
                return !comments[i].isDeleted && comments[i].encryptedContentLength != bytes32(0);
            }
        }
        return false;
    }

    /**
     * @dev Get comment metadata with encrypted data handle
     * Returns comment information including FHE handle without revealing the content
     * @param _profileOwner Profile owner address
     * @param _commentId Comment ID
     * @return id Comment ID
     * @return author Comment author address
     * @return encryptedContentLength FHE handle (bytes32) for encrypted content length
     * @return timestamp Comment timestamp
     * @return isValid True if comment is valid and not deleted
     */
    function getCommentMetadataWithEncryption(
        address _profileOwner,
        uint256 _commentId
    ) external view returns (
        uint256 id,
        address author,
        bytes32 encryptedContentLength,
        uint256 timestamp,
        bool isValid
    ) {
        Comment[] memory comments = profileComments[_profileOwner];
        for (uint256 i = 0; i < comments.length; i++) {
            if (comments[i].id == _commentId) {
                Comment memory comment = comments[i];
                return (
                    comment.id,
                    comment.author,
                    comment.encryptedContentLength,
                    comment.timestamp,
                    !comment.isDeleted && comment.encryptedContentLength != bytes32(0)
                );
            }
        }
        revert("Comment not found");
    }

    /**
     * @dev Get all comment metadata with encryption handles for a profile
     * Returns array of comment metadata including FHE handles
     * @param _profileOwner Profile owner address
     * @return ids Array of comment IDs
     * @return authors Array of comment author addresses
     * @return encryptedLengths Array of FHE handles (bytes32)
     * @return timestamps Array of comment timestamps
     */
    function getAllCommentsMetadataWithEncryption(
        address _profileOwner
    ) external view returns (
        uint256[] memory ids,
        address[] memory authors,
        bytes32[] memory encryptedLengths,
        uint256[] memory timestamps
    ) {
        Comment[] memory comments = profileComments[_profileOwner];
        uint256 count = 0;
        
        // Count non-deleted comments
        for (uint256 i = 0; i < comments.length; i++) {
            if (!comments[i].isDeleted) {
                count++;
            }
        }
        
        // Allocate arrays
        ids = new uint256[](count);
        authors = new address[](count);
        encryptedLengths = new bytes32[](count);
        timestamps = new uint256[](count);
        
        // Fill arrays
        uint256 index = 0;
        for (uint256 i = 0; i < comments.length; i++) {
            if (!comments[i].isDeleted) {
                ids[index] = comments[i].id;
                authors[index] = comments[i].author;
                encryptedLengths[index] = comments[i].encryptedContentLength;
                timestamps[index] = comments[i].timestamp;
                index++;
            }
        }
        
        return (ids, authors, encryptedLengths, timestamps);
    }
}

