const hre = require("hardhat");
const path = require("path");
const fs = require("fs");

// Load .env manually
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach(line => {
    const [key, ...values] = line.split("=");
    if (key && values.length > 0) {
      process.env[key.trim()] = values.join("=").trim();
    }
  });
}

async function main() {
  console.log("Starting deployment to Sepolia...\n");
  
  const privateKey = process.env.PRIVATE_KEY;
  const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://sepolia.drpc.org";
  
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not found");
  }
  
  console.log("RPC URL:", rpcUrl);
  console.log("Private key configured:", privateKey ? "Yes" : "No");

  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("Failed to get deployer signer. Check your network configuration and private key.");
  }
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy ReputationManager
  console.log("\n1. Deploying ReputationManager...");
  const ReputationManager = await hre.ethers.getContractFactory("ReputationManager");
  const reputationManager = await ReputationManager.deploy();
  await reputationManager.waitForDeployment();
  const reputationManagerAddress = await reputationManager.getAddress();
  console.log("ReputationManager deployed to:", reputationManagerAddress);

  // Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    deployer: deployer.address,
    contracts: {
      ReputationManager: reputationManagerAddress,
    },
    timestamp: new Date().toISOString(),
  };

  // Save to file
  const contractAddressPath = path.resolve(__dirname, "../CONTRACT_ADDRESS.txt");
  fs.writeFileSync(contractAddressPath, reputationManagerAddress);

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("\n✅ Deployment completed successfully!");
  console.log("\nContract address saved to:", contractAddressPath);

  // Instructions for verification
  console.log("\n=== Verification Commands ===");
  console.log(`npx hardhat verify --network sepolia ${reputationManagerAddress}`);
  console.log("\n=== Environment Variable ===");
  console.log(`Add to .env: NEXT_PUBLIC_REPUTATION_MANAGER_ADDRESS=${reputationManagerAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

