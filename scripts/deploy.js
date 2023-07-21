// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const [owner, otherAccount, otherAccount2] = await hre.ethers.getSigners();
  const multiSigWallet = await hre.ethers.deployContract("MultiSigWallet", [
    [owner.address, otherAccount.address, otherAccount2.address],
    3
  ]);

  await multiSigWallet.waitForDeployment();

  console.log(
    `MultiSigWallet deployed to ${multiSigWallet.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
