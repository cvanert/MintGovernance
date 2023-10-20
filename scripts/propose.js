const { ethers } = require("hardhat");
const { parseEther } = ethers.utils;
const fs = require("fs");
const { governorAddress, tokenAddress } = require("./_contracts");

async function main() {
    // Get owner address
    const [owner, otherAccount] = await ethers.getSigners();

    const governor = await ethers.getContractAt("MyGovernor", governorAddress, owner);
    const token = await ethers.getContractAt("MyToken", tokenAddress, owner);

    const tx = await governor.propose(
        [token.address],
        [0],
        [
            token.interface.encodeFunctionData("mint", [
                owner.address,
                parseEther("25000"),
            ]),
        ],
        "Give the owner more tokens!"
    );
    const receipt = await tx.wait();
    console.log(receipt);
    const event = await receipt.events.find((x) => x.event === "ProposalCreated");
    const { proposalId } = event.args;

    console.log(`Proposal created with id ${proposalId}`);

    const proposalState = await governor.state(proposalId);
    console.log(`Current Proposal State: ${proposalState}`);

    fs.writeFileSync(
        "./scripts/_lastProposal.js",
        `module.exports = {\n    proposalId: "${proposalId}"\n};`
    );

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});