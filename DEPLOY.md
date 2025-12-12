# Deployment Instructions

## SSH Key Setup

SSH key has been generated for deployment. 

### Public Key (add to GitHub):

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHRglXfOmV80lXcxGVwuLoXA77mkeBAJXGE869oG1fnn deploy@private-reputation
```

### Steps to add SSH key to GitHub:

1. Go to GitHub → Settings → SSH and GPG keys
2. Click "New SSH key"
3. Title: `private-reputation-deploy`
4. Key: Paste the public key above
5. Click "Add SSH key"

### Configure Git to use SSH key:

The SSH key is located at: `C:\Users\rmanello studio\.ssh\id_ed25519_private_reputation`

Git is already configured to use this key for the repository.

## First Push

After adding the SSH key to GitHub, you can push:

```bash
git commit -m "Initial commit: Private Reputation System"
git branch -M main
git push -u origin main
```

## Environment Variables

Make sure to set these in your deployment platform (Vercel/Netlify):

- `NEXT_PUBLIC_REPUTATION_MANAGER_ADDRESS` - Contract address
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID (optional)
- `SEPOLIA_RPC_URL` - Sepolia RPC endpoint (for deployment only)



