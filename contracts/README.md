# ReputationManager Smart Contract

## Overview

ReputationManager is a smart contract implementing a Fully Homomorphic Encryption (FHE) enabled reputation system using Zama FHEVM. This contract allows users to create profiles, vote on profiles, and add encrypted comments where comment content lengths are stored as FHE-encrypted data.

## Features

- **Profile Management**: Create and update user profiles with nickname, social links, description, and avatar
- **Voting System**: Like/dislike profiles with vote tracking
- **FHE-Encrypted Comments**: Comment content lengths are encrypted using Fully Homomorphic Encryption before being stored on-chain
- **Privacy-Preserving**: Comment content is never stored on-chain in plain text

## Contract Details

- **Network**: Sepolia Testnet
- **Contract Address**: `0xF49158AB8AC3A4c403e5844F7b086FE52F65c38F`
- **Solidity Version**: `^0.8.20`
- **Compiler**: Optimized with 200 runs, via-IR enabled

## FHE Implementation

The contract uses Zama FHEVM to encrypt comment content lengths:

- Comment content lengths are encrypted using FHE before being stored
- FHE handles (bytes32) are stored on-chain instead of plain text
- Original comment content is stored client-side in localStorage
- The contract provides view functions to retrieve FHE handles for decryption

### FHE Functions

- `getCommentEncryptedContentLength(address, uint256)`: Get FHE handle for a specific comment
- `getProfileEncryptedCommentLengths(address)`: Get all FHE handles for a profile's comments
- `getEncryptedCommentCount(address)`: Count comments with valid FHE encrypted data
- `verifyCommentEncryption(address, uint256)`: Verify comment has valid FHE encrypted data
- `getCommentMetadataWithEncryption(address, uint256)`: Get comment metadata with FHE handle
- `getAllCommentsMetadataWithEncryption(address)`: Get all comments metadata with FHE handles

## Deployment

### Prerequisites

1. Node.js and npm installed
2. Hardhat installed: `npm install --save-dev hardhat`
3. Sepolia ETH in your wallet
4. `.env` file with:
   ```
   PRIVATE_KEY=your_private_key
   SEPOLIA_RPC_URL=https://sepolia.drpc.org
   ETHERSCAN_API_KEY=your_etherscan_api_key (optional, for verification)
   ```

### Compile

```bash
npm run compile
# or
npx hardhat compile
```

### Deploy

Using the simple deployment script:

```bash
node scripts/deploy-simple.js
```

Or using Hardhat:

```bash
npm run deploy:sepolia
# or
npx hardhat run scripts/deploy.js --network sepolia
```

### Verify (Optional)

```bash
npm run verify <CONTRACT_ADDRESS>
# or
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## Contract Structure

### Structs

- **Profile**: User profile data (owner, nickname, social links, description, avatar, timestamps)
- **Comment**: Comment data (id, author, profileOwner, encryptedContentLength (FHE handle), timestamp, isDeleted)
- **Vote**: Vote data (voter, isLike, timestamp)

### Main Functions

#### Profile Management
- `createProfile(nickname, twitter, discord, description, avatarHash)`: Create a new profile
- `updateProfile(nickname, twitter, discord, description, avatarHash)`: Update existing profile
- `getProfile(address)`: Get profile data

#### Voting
- `vote(address profileOwner, bool isLike)`: Cast a vote on a profile
- `removeVote(address profileOwner)`: Remove your vote
- `getVoteCounts(address)`: Get like/dislike counts
- `hasUserVoted(address profileOwner, address voter)`: Check if user has voted

#### Comments (FHE-Encrypted)
- `addComment(address profileOwner, bytes32 encryptedContentLength)`: Add a comment with FHE-encrypted content length
- `deleteComment(address profileOwner, uint256 commentId)`: Delete a comment
- `getProfileComments(address)`: Get all comments for a profile

## Events

- `ProfileCreated(address indexed owner, string nickname)`
- `ProfileUpdated(address indexed owner, string nickname)`
- `VoteCast(address indexed profileOwner, address indexed voter, bool isLike)`
- `VoteRemoved(address indexed profileOwner, address indexed voter)`
- `CommentAdded(address indexed profileOwner, address indexed author, uint256 commentId)`
- `CommentDeleted(address indexed profileOwner, uint256 commentId)`

## Security Considerations

- Profiles can only be created once per address
- Users cannot vote on their own profiles
- Users can only delete their own comments
- FHE encryption ensures comment content lengths are never exposed on-chain

## License

MIT

## Author

Deployed by: `0x729E31bB1f0299291d58f48937c7FbBFaD225347`
Deployment Date: 2025-12-26

