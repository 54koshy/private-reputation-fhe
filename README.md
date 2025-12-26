# 🔒 Private Reputation System

A decentralized reputation platform built with **Fully Homomorphic Encryption (FHE)** on Ethereum Sepolia testnet. This project enables users to create profiles, vote on profiles, and leave encrypted comments while maintaining privacy through Zama FHEVM.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [FHE Implementation](#fhe-implementation)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Smart Contract](#smart-contract)
- [Frontend Development](#frontend-development)
- [Deployment](#deployment)
- [Usage Guide](#usage-guide)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

## Overview

The Private Reputation System is a Next.js-based web3 application that leverages Fully Homomorphic Encryption (FHE) to protect sensitive user data on-chain. Unlike traditional reputation systems where all data is publicly visible, this system encrypts comment content lengths using FHE, ensuring privacy while maintaining blockchain transparency.

### Key Highlights

- 🔐 **Privacy-Preserving**: Comment content lengths encrypted with FHE
- 🚀 **Decentralized**: Fully on-chain reputation management
- 👥 **Community-Driven**: Vote and comment system for profiles
- 💻 **Modern Stack**: Next.js 14, React, TypeScript, Tailwind CSS
- 🔗 **Web3 Integration**: Wagmi, ConnectKit for seamless wallet connectivity

## Features

### Core Functionality

#### Profile Management
- ✅ Create unique profiles with nickname, social links, and description
- ✅ Update profile information
- ✅ Pixel avatar generation
- ✅ View all community profiles
- ✅ Public profile metadata

#### Voting System
- ✅ Like/dislike profiles
- ✅ Remove votes
- ✅ Real-time vote counts
- ✅ Vote tracking (one vote per user per profile)
- ✅ Public voting history

#### FHE-Encrypted Comments
- ✅ Add comments with encrypted content lengths
- ✅ Delete own comments
- ✅ Client-side content storage in localStorage
- ✅ On-chain FHE handles only
- ✅ Privacy-preserving comment system

#### User Experience
- ✅ Wallet connection via ConnectKit
- ✅ Responsive design with Tailwind CSS
- ✅ Real-time updates
- ✅ Error handling and loading states
- ✅ Transaction status tracking

## Tech Stack

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide icons
- **State Management**: React Hooks, Wagmi

### Blockchain

- **Network**: Ethereum Sepolia Testnet
- **Wallet Integration**: Wagmi v2, ConnectKit
- **RPC**: Custom Sepolia RPC endpoint
- **Transaction Management**: Wagmi hooks

### Encryption

- **FHE SDK**: Zama FHEVM Relayer SDK (`@zama-fhe/relayer-sdk`)
- **Encryption**: Fully Homomorphic Encryption via FHEVM
- **Storage**: Client-side localStorage for original content

### Smart Contracts

- **Language**: Solidity ^0.8.20
- **Development**: Hardhat
- **Compilation**: Optimized with 200 runs, via-IR
- **Network**: Sepolia Testnet

### Deployment

- **Frontend**: Vercel
- **CI/CD**: Vercel CLI
- **Environment**: Serverless functions

## Architecture

### System Overview

```
┌─────────────────┐
│   Next.js App   │
│   (Frontend)    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐  ┌──────────────┐
│ Wagmi  │  │ FHEVM SDK    │
│ Hooks  │  │ (Encryption) │
└───┬────┘  └──────┬───────┘
    │              │
    │         ┌────▼─────┐
    │         │ localStorage│
    │         │ (Content)  │
    │         └───────────┘
    │
    ▼
┌──────────────────┐
│  Sepolia Network │
│  Smart Contract  │
│  (ReputationMgr) │
└──────────────────┘
```

### Data Flow

#### Profile Creation
1. User fills profile form
2. Transaction sent via Wagmi
3. Contract creates profile on-chain
4. Event emitted, UI updates

#### Adding Comment (FHE Flow)
1. User enters comment text
2. Client calculates content length
3. FHEVM SDK encrypts length → FHE handle (bytes32)
4. Original content stored in localStorage
5. Transaction sent with FHE handle
6. Contract stores FHE handle on-chain
7. UI retrieves original content from localStorage for display

#### Voting
1. User clicks like/dislike
2. Transaction sent via Wagmi
3. Contract updates vote mapping
4. Event emitted
5. UI refreshes vote counts

## FHE Implementation

### What is FHE?

**Fully Homomorphic Encryption (FHE)** allows computations on encrypted data without decryption. In this project, comment content lengths are encrypted before being stored on-chain, ensuring privacy while maintaining blockchain benefits.

### FHE Workflow

#### Encryption Process

```javascript
// 1. User enters comment
const commentText = "Great profile!";
const contentLength = commentText.length;

// 2. Initialize FHE Relayer
const relayer = await initFHERelayer(contractAddress);

// 3. Encrypt content length
const encryptedHandle = await encryptCommentLength(
  contentLength,
  userAddress,
  contractAddress
);

// 4. Store original in localStorage
storeOriginalComment(commentId, profileOwner, commentText);

// 5. Send encrypted handle to contract
await addComment(profileOwner, encryptedHandle);
```

#### Decryption Process

```javascript
// 1. Get FHE handle from contract
const handle = await contract.getCommentEncryptedContentLength(
  profileOwner,
  commentId
);

// 2. Decrypt using FHEVM SDK (if needed)
const decryptedLength = await relayer.decrypt(handle);

// 3. Retrieve original content from localStorage
const originalContent = getOriginalComment(commentId, profileOwner);
```

### FHE Files

- **`lib/fheEncryption.ts`**: Core FHE encryption logic
  - `initFHERelayer()`: Initialize Zama FHEVM Relayer SDK
  - `encryptCommentLength()`: Encrypt comment length to bytes32 handle
  - `storeOriginalComment()`: Store original content in localStorage
  - `getOriginalComment()`: Retrieve original content from localStorage

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **yarn**: Package manager
- **Git**: Version control
- **MetaMask** or compatible Web3 wallet
- **Sepolia ETH**: For transactions (get from [faucet](https://sepoliafaucet.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wallet-6
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp ENV_EXAMPLE.txt .env.local
   ```

4. **Configure environment variables**
   ```env
   # Required
   NEXT_PUBLIC_REPUTATION_MANAGER_ADDRESS=0xF49158AB8AC3A4c403e5844F7b086FE52F65c38F
   SEPOLIA_RPC_URL=https://sepolia.drpc.org
   
   # Optional
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   PRIVATE_KEY=your_private_key (for contract deployment only)
   ETHERSCAN_API_KEY=your_etherscan_api_key (for contract verification)
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

### First-Time Setup

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Select MetaMask or other wallet
   - Approve connection
   - Ensure you're on Sepolia testnet

2. **Get Sepolia ETH**
   - Visit [Sepolia Faucet](https://sepoliafaucet.com)
   - Request test ETH to your wallet address
   - Wait for confirmation

3. **Create Profile**
   - After connecting wallet, create your profile
   - Fill in nickname, social links, description
   - Submit transaction
   - Wait for confirmation

## Project Structure

```
wallet-6/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Homepage (All Profiles)
│   ├── providers.tsx            # Wagmi & ConnectKit providers
│   ├── globals.css              # Global styles
│   └── me/
│       └── page.tsx             # My Profile page
│
├── components/                   # React components
│   ├── ProfileCard.tsx          # Profile display card
│   └── ProfileForm.tsx          # Profile create/edit form
│
├── contracts/                    # Smart contracts
│   ├── ReputationManager.sol    # Main contract with FHE
│   └── README.md                # Contract documentation
│
├── hooks/                        # Custom React hooks
│   ├── useReputation.ts         # Main reputation operations
│   ├── useProfile.ts            # Profile data fetching
│   ├── useVotes.ts              # Voting operations
│   └── useComments.ts           # Comments management
│
├── lib/                          # Utility libraries
│   └── fheEncryption.ts         # FHE encryption functions
│
├── scripts/                      # Deployment scripts
│   └── deploy-simple.js         # Simple contract deployment
│
├── utils/                        # Helper functions
│   ├── address.ts               # Address utilities
│   └── avatarGenerator.ts       # Pixel avatar generation
│
├── public/                       # Static assets
│
├── .env.local                    # Environment variables (gitignored)
├── hardhat.config.ts            # Hardhat configuration
├── next.config.js               # Next.js configuration
├── package.json                 # Dependencies
├── tailwind.config.ts           # Tailwind CSS configuration
└── tsconfig.json                # TypeScript configuration
```

## Configuration

### Environment Variables

#### Required

- **`NEXT_PUBLIC_REPUTATION_MANAGER_ADDRESS`**: Deployed contract address on Sepolia
- **`SEPOLIA_RPC_URL`**: RPC endpoint for Sepolia network

#### Optional

- **`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`**: WalletConnect project ID for wallet connection
- **`PRIVATE_KEY`**: Private key for contract deployment (never commit to git)
- **`ETHERSCAN_API_KEY`**: Etherscan API key for contract verification

### Network Configuration

The app is configured for **Sepolia Testnet**:
- **Chain ID**: 11155111
- **RPC URL**: Configured via `SEPOLIA_RPC_URL`
- **Explorer**: https://sepolia.etherscan.io

### Wallet Setup

1. Install MetaMask or compatible wallet
2. Add Sepolia testnet to wallet
3. Get test ETH from faucet
4. Connect wallet in the app

## Smart Contract

### Contract Information

- **Name**: ReputationManager
- **Address**: `0xF49158AB8AC3A4c403e5844F7b086FE52F65c38F`
- **Network**: Sepolia Testnet
- **Explorer**: [View on Etherscan](https://sepolia.etherscan.io/address/0xF49158AB8AC3A4c403e5844F7b086FE52F65c38F)

### Contract Features

- Profile creation and updates
- Voting system (like/dislike)
- FHE-encrypted comment storage
- Public profile and vote data
- Event emission for all operations

### FHE Functions

The contract provides several FHE-related view functions:

- `getCommentEncryptedContentLength()`: Get FHE handle for specific comment
- `getProfileEncryptedCommentLengths()`: Get all FHE handles for profile
- `getEncryptedCommentCount()`: Count comments with valid FHE data
- `verifyCommentEncryption()`: Verify comment encryption status
- `getCommentMetadataWithEncryption()`: Get comment metadata with FHE handle
- `getAllCommentsMetadataWithEncryption()`: Get all comments metadata

### Deploying Contract

See [contracts/README.md](./contracts/README.md) for detailed deployment instructions.

Quick deploy:
```bash
node scripts/deploy-simple.js
```

## Frontend Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server on http://localhost:3000

# Build
npm run build        # Create production build
npm start            # Start production server

# Contract
npm run compile      # Compile smart contracts
npm run deploy:sepolia  # Deploy contract to Sepolia

# Linting
npm run lint         # Run ESLint
```

### Key Components

#### `ProfileCard`
Displays a user profile with:
- Avatar, nickname, address
- Social links (Twitter, Discord)
- Description
- Vote buttons and counts
- Comments section
- Add comment form

#### `ProfileForm`
Form for creating/editing profiles:
- Nickname input
- Twitter handle
- Discord username
- Description textarea
- Avatar hash (auto-generated)

#### Custom Hooks

**`useReputation`**
- Main hook for all reputation operations
- Manages FHE relayer initialization
- Handles profile, vote, and comment operations
- Returns loading states and transaction status

**`useProfile`**
- Fetches profile data for an address
- Uses Wagmi `useReadContract`
- Handles different data formats

**`useVotes`**
- Fetches vote counts and voting status
- Real-time vote data

**`useComments`**
- Fetches comments for a profile
- Retrieves original content from localStorage
- Filters deleted comments

### Styling

- **Framework**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Custom CSS animations
- **Responsive**: Mobile-first design

## Deployment

### Deploy Frontend to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to production**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables** in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add all required variables
   - Redeploy if needed

### Environment Variables in Vercel

Required variables:
- `NEXT_PUBLIC_REPUTATION_MANAGER_ADDRESS`
- `SEPOLIA_RPC_URL`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (optional)

### Deploy Contract

See [contracts/README.md](./contracts/README.md) for detailed instructions.

## Usage Guide

### Creating a Profile

1. Connect your wallet
2. Click "Create Profile" button
3. Fill in the form:
   - **Nickname**: Required, unique identifier
   - **Twitter**: Optional, your Twitter handle
   - **Discord**: Optional, your Discord username
   - **Description**: Optional, bio or description
4. Submit transaction
5. Approve in wallet
6. Wait for confirmation

### Voting on Profiles

1. Navigate to any profile
2. Click 👍 (like) or 👎 (dislike)
3. Approve transaction in wallet
4. Vote count updates automatically

**Note**: You can only vote once per profile. To change your vote, remove it first, then vote again.

### Adding Comments

1. Open a profile's comments section
2. Click "Add comment"
3. Enter your comment text
4. Submit (comment length will be encrypted with FHE)
5. Approve transaction in wallet
6. Comment appears after confirmation

**Privacy**: Only the comment length is encrypted and stored on-chain. The original content is stored in your browser's localStorage.

### Viewing My Profile

1. Connect wallet
2. Click "My Profile" in header
3. View your profile details
4. Edit profile if needed
5. See comments on your profile

## Security

### Privacy Features

- ✅ Comment content lengths encrypted with FHE
- ✅ Original comment content stored client-side only
- ✅ FHE handles (bytes32) stored on-chain
- ✅ No sensitive data exposed on blockchain

### Security Considerations

- ⚠️ Profile metadata (nickname, description) is public
- ⚠️ Vote history is publicly accessible
- ⚠️ Comment authors are public
- ⚠️ Original comment content stored in localStorage (can be lost if cleared)

### Best Practices

1. **Never share private keys**
2. **Verify contract address** before transactions
3. **Check transaction details** in wallet before approving
4. **Use hardware wallets** for large transactions
5. **Clear localStorage** only if you understand consequences

## Troubleshooting

### Common Issues

#### Wallet Connection Issues

**Problem**: Wallet won't connect
- **Solution**: 
  - Ensure MetaMask is installed and unlocked
  - Check that you're on Sepolia network
  - Refresh page and try again
  - Check browser console for errors

#### Transaction Failures

**Problem**: Transactions fail or revert
- **Solution**:
  - Ensure sufficient Sepolia ETH
  - Check gas limit settings
  - Verify contract address is correct
  - Check if profile already exists (for creation)

#### FHE Encryption Errors

**Problem**: Comments fail to encrypt
- **Solution**:
  - Check FHE relayer initialization logs
  - Verify contract address matches relayer config
  - Ensure browser supports required features
  - Try refreshing the page

#### Missing Comments

**Problem**: Comments don't appear
- **Solution**:
  - Check localStorage isn't cleared
  - Verify transaction was confirmed
  - Refresh comments section
  - Check browser console for errors

#### Profile Not Loading

**Problem**: Profile data doesn't load
- **Solution**:
  - Verify contract address in environment variables
  - Check RPC endpoint is accessible
  - Ensure correct network (Sepolia)
  - Check browser console for errors

### Getting Help

1. **Check browser console** for error messages
2. **Verify environment variables** are set correctly
3. **Check transaction on Etherscan** for status
4. **Review contract events** for confirmation
5. **Check network connectivity** to RPC endpoint

### Debug Mode

Enable verbose logging by checking browser console:
- FHE relayer initialization logs
- Transaction status updates
- Hook state changes
- Contract interaction logs

## Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh)
- [ConnectKit Documentation](https://docs.family.co/connectkit)
- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Tools

- [Etherscan Sepolia](https://sepolia.etherscan.io)
- [Sepolia Faucet](https://sepoliafaucet.com)
- [MetaMask](https://metamask.io)
- [Hardhat](https://hardhat.org)

### Community

- [Ethereum Stack Exchange](https://ethereum.stackexchange.com)
- [Zama Discord](https://discord.gg/zama)
- [Next.js Discord](https://discord.gg/nextjs)

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review documentation above

---

**Live Demo**: [https://private-reputation.vercel.app](https://private-reputation.vercel.app)

**Built with 🔒 FHE technology by Zama**
