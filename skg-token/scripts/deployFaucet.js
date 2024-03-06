// Require Hardhat module
const hre = require('hardhat');

// Main function to deploy Faucet contract
async function main() {
  // Get Faucet ContractFactory
  const Faucet = await hre.ethers.getContractFactory('Faucet');
  // Deploy Faucet contract with the provided ERC20 token address
  const faucet = await Faucet.deploy(
    '0x021302D692f24cf0646DB322427a38FBa1B42C62'
  );

  // Wait for deployment to be completed
  await faucet.deployed();

  // Log the deployed contract address
  console.log('Facuet contract deployed: ', faucet.address);
}

// Call the main function and handle errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
