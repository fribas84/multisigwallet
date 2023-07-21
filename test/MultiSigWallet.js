const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("MultiSigWallet", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deploy() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, otherAccount2, otherAccount3] =
      await ethers.getSigners();

    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const multiSigWallet = await MultiSigWallet.deploy(
      [owner.address, otherAccount.address, otherAccount2.address],
      3
    );

    return {
      multiSigWallet,
      owner,
      otherAccount,
      otherAccount2,
      otherAccount3,
    };
  }

  describe("Deployment and Owners validation", function () {
    it("Quorom Required should be equal to 3", async function () {
      const { multiSigWallet } = await loadFixture(deploy);
      expect(await multiSigWallet.quorumRequired()).to.equal(3);
    });

    it("Owners should be 3", async function () {
      const { multiSigWallet } = await loadFixture(deploy);
      const owners = await multiSigWallet.getOwners();
      expect(owners.length).to.equal(3);
    });

    it("Owners should be first ether signers", async function () {
      const { multiSigWallet, owner, otherAccount, otherAccount2 } =
        await loadFixture(deploy);
      const owners = await multiSigWallet.getOwners();
      expect(owners).to.include(owner.address);
      expect(owners).to.include(otherAccount.address);
      expect(owners).to.include(otherAccount2.address);
    });

    it("IsOwner should reply true for owners", async function () {
      const { multiSigWallet, owner, otherAccount, otherAccount2 } =
        await loadFixture(deploy);
      expect(await multiSigWallet.isOwner(owner.address)).equal(true);
      expect(await multiSigWallet.isOwner(otherAccount2.address)).equal(true);
      expect(await multiSigWallet.isOwner(otherAccount.address)).equal(true);
    });
    it("IsOwner should return false for a non-owner address", async function () {
      const { multiSigWallet, otherAccount3 } = await loadFixture(deploy);
      expect(await multiSigWallet.isOwner(otherAccount3.address)).equal(false);
    });
  });
  describe("Deposit and receive", function () {
    it("An Owner can deposit and balance is change", async function () {
      const { multiSigWallet, owner, otherAccount, otherAccount2 } =
        await loadFixture(deploy);
        
        await
    });
  });
});
