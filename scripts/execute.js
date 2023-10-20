const { ethers } = require("hardhat");
const { toUtf8Bytes, keccak256, parseEther } = ethers.utils;
const { governorAddress, tokenAddress } = require("./_contracts");
const { proposalId } = require("./_lastProposal");

async function main() {
  // Get owner address
  const [owner, otherAccount] = await ethers.getSigners();

  const governor = await ethers.getContractAt("MyGovernor", governorAddress);
  const token = await ethers.getContractAt("MyToken", tokenAddress);

  proposalState = await governor.state(proposalId);
  console.log(
    `Current Proposal State: ${proposalState} (should be 1. if 0 wait for it)`
  );

  const preBalance = await token.balanceOf(owner.address);
  console.log(`Balance before executing: ${preBalance}`);

  const tx = await governor.execute(
    [token.address],
    [0],
    [
      token.interface.encodeFunctionData("mint", [
        owner.address,
        parseEther("25000"),
      ]),
    ],
    keccak256(toUtf8Bytes("Give the owner more tokens!"))
  );

  const balance = await token.balanceOf(owner.address);
  console.log(`Balance post executing: ${balance}`);

  console.log(tx);

  proposalState = await governor.state(proposalId);
  console.log(`Current Proposal State: ${proposalState}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});