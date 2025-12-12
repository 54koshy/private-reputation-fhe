# Private Reputation System

A decentralized reputation platform built with Fully Homomorphic Encryption (FHE) on Ethereum Sepolia testnet.

## Features

- Create and manage your profile with pixel avatar generation
- Edit profile (nickname, Twitter, Discord, description)
- View all community profiles
- Like/dislike profiles
- Leave and delete comments on profiles
- Private reputation management with FHE

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Blockchain**: Ethereum Sepolia, Wagmi, ConnectKit
- **Smart Contracts**: Solidity, Hardhat
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask or compatible wallet

### Installation

1. Clone the repository:
```bash
git clone git@github.com:54koshy/private-reputation-fhe.git
cd private-reputation-fhe
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp ENV_EXAMPLE.txt .env.local
```

4. Fill in your environment variables:
- `SEPOLIA_RPC_URL` - Sepolia RPC endpoint
- `PRIVATE_KEY` - Your wallet private key (for deployment only)
- `NEXT_PUBLIC_REPUTATION_MANAGER_ADDRESS` - Contract address (after deployment)
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID (optional)
- `ETHERSCAN_API_KEY` - Etherscan API key (for contract verification)

5. Deploy contracts:
```bash
npm run deploy:sepolia
```

6. Start development server:
```bash
npm run dev
```

## Contract Address

The deployed contract address is stored in `CONTRACT_ADDRESS.txt`.

Current address: `0x4A688A45Eef0A1EE6C25930Cfee5B988EC5d351B`

## Project Structure

```
├── app/              # Next.js app directory
│   ├── home/         # All profiles page
│   ├── me/           # My profile page
│   └── page.tsx      # Landing page
├── components/       # React components
├── contracts/        # Solidity smart contracts
├── hooks/            # Custom React hooks
├── scripts/          # Deployment scripts
└── utils/            # Utility functions
```

## Smart Contract

The `ReputationManager` contract handles:
- Profile creation and updates
- Voting (likes/dislikes)
- Comments management
- Profile retrieval

## License

MIT



