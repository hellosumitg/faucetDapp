// Require Hardhat module
const hre = require('hardhat');

// Main function to deploy SkgToken contract
async function main() {
  // Get SkgToken ContractFactory
  const SkgToken = await hre.ethers.getContractFactory('SkgToken');
  // Deploy SkgToken contract with cap of 100,000,000 tokens and block reward of 50 tokens
  const skgToken = await SkgToken.deploy(100000000, 50);

  // Wait for deployment to be completed
  await skgToken.deployed();

  // Log the deployed contract address
  console.log('Skg Token deployed: ', skgToken.address);
}

// Call the main function and handle errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
