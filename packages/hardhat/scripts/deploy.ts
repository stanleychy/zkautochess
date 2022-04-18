import { ethers } from "hardhat";

async function main() {
  const verifierContract = await ethers.getContractFactory("Verifier");
  const verifier = await verifierContract.deploy();
  await verifier.deployed();
  console.log("Verifier deployed to:", verifier.address);

  const zkAutoChessContract = await ethers.getContractFactory("zkAutoChess");
  const zkAutoChess = await zkAutoChessContract.deploy(verifier.address);
  await zkAutoChess.deployed();

  console.log("zkAutoChess deployed to:", zkAutoChess.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
