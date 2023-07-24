const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

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
    it("Contract should not be deployed with invalid owners", async function () {
      const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
      await expect(MultiSigWallet.deploy([], 3)).to.revertedWith(
        "At least one owner is required"
      );
    });
    it("Contract should not be deployed with invalid quorum number", async function () {
      const [owner, otherAccount, otherAccount2] = await ethers.getSigners();
      const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");

      await expect(
        MultiSigWallet.deploy(
          [owner.address, otherAccount.address, otherAccount2.address],
          10
        )
      ).to.revertedWith("Invalid number of required quorum");
    });
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
  describe("Deposit", function () {
    it("Initial balance should be equal to 0", async function () {
      const { multiSigWallet } = await loadFixture(deploy);
      expect(await multiSigWallet.getBalance()).to.equal(0);
    });
    it("An Owner should deposit and balance increase", async function () {
      const { multiSigWallet } = await loadFixture(deploy);
      const initialBalance = await multiSigWallet.getBalance();
      expect(initialBalance).to.equal(0);
      const options = { value: ethers.parseEther("5") };
      await multiSigWallet.deposit(options);
      const newBalance = await multiSigWallet.getBalance();
      expect(newBalance).to.greaterThan(initialBalance);
    });
    it("Not Owner account can deposit", async function () {
      const { multiSigWallet, otherAccount3 } = await loadFixture(deploy);
      const initialBalance = await multiSigWallet.getBalance();
      expect(initialBalance).to.equal(0);
      const options = { value: ethers.parseEther("5") };
      await multiSigWallet.connect(otherAccount3).deposit(options);
      const newBalance = await multiSigWallet.getBalance();
      expect(newBalance).to.greaterThan(initialBalance);
    });
  });
  describe("Withdraw request creation", function () {
    it("Cannot create a widthdaw request bigger than balance", async function () {
      const { multiSigWallet, owner } = await loadFixture(deploy);
      const initialBalance = await multiSigWallet.getBalance();
      expect(initialBalance).to.equal(0);
      const options = { value: ethers.parseEther("5") };
      await multiSigWallet.deposit(options);
      const newBalance = await multiSigWallet.getBalance();
      expect(newBalance).to.greaterThan(initialBalance);
      expect(await multiSigWallet.createdWithdrawTx(owner.address, 10));
    });

    it("Owner 1 can create a Withdraw request", async function () {
      const { multiSigWallet, owner } = await loadFixture(deploy);
      const initialBalance = await multiSigWallet.getBalance();
      expect(initialBalance).to.equal(0);
      const options = { value: ethers.parseEther("5") };
      await multiSigWallet.deposit(options);
      const newBalance = await multiSigWallet.getBalance();
      expect(newBalance).to.greaterThan(initialBalance);
      expect(
        await multiSigWallet.createdWithdrawTx(owner.address, newBalance)
      ).to.revertedWith("invalid amount to withdraw");
    });
    it("Owner 2 can create a Withdraw request", async function () {
      const { multiSigWallet, otherAccount } = await loadFixture(deploy);
      const initialBalance = await multiSigWallet.getBalance();
      expect(initialBalance).to.equal(0);
      const options = { value: ethers.parseEther("5") };
      await multiSigWallet.deposit(options);
      const newBalance = await multiSigWallet.getBalance();
      expect(newBalance).to.greaterThan(initialBalance);
      expect(
        await multiSigWallet
          .connect(otherAccount)
          .createdWithdrawTx(otherAccount.address, newBalance)
      );
    });
    it("Owner 3 can create a Withdraw request", async function () {
      const { multiSigWallet, otherAccount2 } = await loadFixture(deploy);
      const initialBalance = await multiSigWallet.getBalance();
      expect(initialBalance).to.equal(0);
      const options = { value: ethers.parseEther("5") };
      await multiSigWallet.deposit(options);
      const newBalance = await multiSigWallet.getBalance();
      expect(newBalance).to.greaterThan(initialBalance);
      expect(
        await multiSigWallet
          .connect(otherAccount2)
          .createdWithdrawTx(otherAccount2.address, newBalance)
      );
    });

    it("A not Owner cannot create a Withdraw request", async function () {
      const { multiSigWallet, otherAccount3 } = await loadFixture(deploy);
      const initialBalance = await multiSigWallet.getBalance();
      expect(initialBalance).to.equal(0);
      const options = { value: ethers.parseEther("5") };
      await multiSigWallet.deposit(options);
      const newBalance = await multiSigWallet.getBalance();
      expect(newBalance).to.greaterThan(initialBalance);
      await expect(
        multiSigWallet
          .connect(otherAccount3)
          .createdWithdrawTx(otherAccount3.address, newBalance)
      ).to.revertedWith("not owner");
    });
  });
  describe("Withdraw request and approve", function () {
    it("Funds are sent to destinaton once is approved", async function () {
      const provider = hre.ethers.provider;
      const { multiSigWallet, owner, otherAccount, otherAccount2 } =
        await loadFixture(deploy);
      const initialBalance = await multiSigWallet.getBalance();
      expect(initialBalance).to.equal(0);
      const depositValue = ethers.parseEther("1000");
      const options = { value: depositValue };
      await multiSigWallet.deposit(options);
      const accountBalanceAfterdeposit = await provider.getBalance(
        owner.address
      );
      const depositBalance = await multiSigWallet.getBalance();
      expect(depositBalance).to.greaterThan(initialBalance);
      let withdrawRequest = await multiSigWallet.createdWithdrawTx(
        owner.address,
        depositValue
      );
      withdrawRequest = withdrawRequest.value;
      await multiSigWallet.approveWithdrawTx(withdrawRequest);
      await multiSigWallet
        .connect(otherAccount)
        .approveWithdrawTx(withdrawRequest);
      await multiSigWallet
        .connect(otherAccount2)
        .approveWithdrawTx(withdrawRequest);
      expect(await multiSigWallet.getBalance()).to.equal(0);
      const accountBalanceAfterWithdraw = await provider.getBalance(
        owner.address
      );
      expect(accountBalanceAfterWithdraw).to.greaterThan(
        accountBalanceAfterdeposit
      );
    });
    it("Partial withdraw", async function () {
      const provider = hre.ethers.provider;
      const { multiSigWallet, owner, otherAccount, otherAccount2 } =
        await loadFixture(deploy);
      const initialBalance = await multiSigWallet.getBalance();
      expect(initialBalance).to.equal(0);
      const nonParsedDeposit = 1000;
      const depositValue = ethers.parseEther(nonParsedDeposit.toString());
      const halfDepositValue = ethers.parseEther(
        (nonParsedDeposit / 2).toString()
      );

      const options = { value: depositValue };
      await multiSigWallet.deposit(options);
      const accountBalanceAfterdeposit = await provider.getBalance(
        owner.address
      );
      const depositBalance = await multiSigWallet.getBalance();
      expect(depositBalance).to.greaterThan(initialBalance);
      let withdrawRequest = await multiSigWallet.createdWithdrawTx(
        owner.address,
        halfDepositValue
      );
      withdrawRequest = withdrawRequest.value;
      await multiSigWallet.approveWithdrawTx(withdrawRequest);
      await multiSigWallet
        .connect(otherAccount)
        .approveWithdrawTx(withdrawRequest);
      await multiSigWallet
        .connect(otherAccount2)
        .approveWithdrawTx(withdrawRequest);
      const accountBalanceAfterWithdraw = await provider.getBalance(
        owner.address
      );
      expect(accountBalanceAfterWithdraw).to.greaterThan(
        accountBalanceAfterdeposit
      );
      expect(await multiSigWallet.getBalance()).to.equal(halfDepositValue);
    });

    it("Not-owner cannot approve a Withdraw TX", async function () {
      const provider = hre.ethers.provider;
      const { multiSigWallet, owner, otherAccount, otherAccount3 } =
        await loadFixture(deploy);
      const initialBalance = await multiSigWallet.getBalance();
      expect(initialBalance).to.equal(0);
      const depositValue = ethers.parseEther("1000");
      const options = { value: depositValue };
      await multiSigWallet.deposit(options);
      const accountBalanceAfterdeposit = await provider.getBalance(
        owner.address
      );
      const depositBalance = await multiSigWallet.getBalance();
      expect(depositBalance).to.greaterThan(initialBalance);
      let withdrawRequest = await multiSigWallet.createdWithdrawTx(
        owner.address,
        depositValue
      );
      withdrawRequest = withdrawRequest.value;
      await multiSigWallet.approveWithdrawTx(withdrawRequest);
      await multiSigWallet
        .connect(otherAccount)
        .approveWithdrawTx(withdrawRequest);
      await expect(
        multiSigWallet.connect(otherAccount3).approveWithdrawTx(withdrawRequest)
      ).to.revertedWith("not owner");
    });
    it("Cannot Approve an existing widthdraw", async function () {
      const provider = hre.ethers.provider;
      const { multiSigWallet, owner, otherAccount } = await loadFixture(deploy);
      const initialBalance = await multiSigWallet.getBalance();
      expect(initialBalance).to.equal(0);
      const depositValue = ethers.parseEther("1000");
      const options = { value: depositValue };
      await multiSigWallet.deposit(options);
      const accountBalanceAfterdeposit = await provider.getBalance(
        owner.address
      );
      const depositBalance = await multiSigWallet.getBalance();
      expect(depositBalance).to.greaterThan(initialBalance);
      let withdrawRequest = await multiSigWallet.createdWithdrawTx(
        owner.address,
        depositValue
      );
      withdrawRequest = withdrawRequest.value;
      await multiSigWallet.approveWithdrawTx(withdrawRequest);
      await multiSigWallet
        .connect(otherAccount)
        .approveWithdrawTx(withdrawRequest);
      await expect(
        multiSigWallet.connect(otherAccount).approveWithdrawTx(10)
      ).to.revertedWithCustomError(multiSigWallet, "TxNotExists");
    });
    it("Cannot reapprove an allready commited withdraw", async function () {
      const provider = hre.ethers.provider;
      const { multiSigWallet, owner, otherAccount, otherAccount2 } =
        await loadFixture(deploy);
      const initialBalance = await multiSigWallet.getBalance();
      expect(initialBalance).to.equal(0);
      const depositValue = ethers.parseEther("1000");
      const options = { value: depositValue };
      await multiSigWallet.deposit(options);
      const accountBalanceAfterdeposit = await provider.getBalance(
        owner.address
      );
      const depositBalance = await multiSigWallet.getBalance();
      expect(depositBalance).to.greaterThan(initialBalance);
      let withdrawRequest = await multiSigWallet.createdWithdrawTx(
        owner.address,
        depositValue
      );
      withdrawRequest = withdrawRequest.value;
      await multiSigWallet.approveWithdrawTx(withdrawRequest);
      await multiSigWallet
        .connect(otherAccount)
        .approveWithdrawTx(withdrawRequest);
      await expect(
        multiSigWallet.connect(otherAccount).approveWithdrawTx(withdrawRequest)
      ).to.revertedWithCustomError(multiSigWallet, "TxAlreadyApproved");
    });

    it("Cannot approved a transaction that was already sent", async function () {
        const [owner, otherAccount, otherAccount2] = await ethers.getSigners();

        const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
        const multiSigWallet = await MultiSigWallet.deploy(
          [owner.address, otherAccount.address, otherAccount2.address],
          2
        );
      const provider = hre.ethers.provider;

      const initialBalance = await multiSigWallet.getBalance();
      expect(initialBalance).to.equal(0);
      const depositValue = ethers.parseEther("1000");
      const options = { value: depositValue };
      await multiSigWallet.deposit(options);
      const accountBalanceAfterdeposit = await provider.getBalance(
        owner.address
      );
      const depositBalance = await multiSigWallet.getBalance();
      expect(depositBalance).to.greaterThan(initialBalance);
      let withdrawRequest = await multiSigWallet.createdWithdrawTx(
        owner.address,
        depositValue
      );
      withdrawRequest = withdrawRequest.value;
      await multiSigWallet.approveWithdrawTx(withdrawRequest);
      await multiSigWallet
        .connect(otherAccount)
        .approveWithdrawTx(withdrawRequest);

      expect(await multiSigWallet.getBalance()).to.equal(0);
      const accountBalanceAfterWithdraw = await provider.getBalance(
        owner.address
      );
      expect(accountBalanceAfterWithdraw).to.greaterThan(
        accountBalanceAfterdeposit
      );

      await expect(
        multiSigWallet.connect(otherAccount2).approveWithdrawTx(withdrawRequest)
      ).to.revertedWithCustomError(multiSigWallet, "TxAlreadySent");
    });
  });
  describe("Fallback and Receive", function () {
    it("Receive", async function () {
      const { multiSigWallet } = await loadFixture(deploy);

      const provider = hre.ethers.provider;
      const depositValue = ethers.parseEther("1000");
      const initialBalance = await multiSigWallet.getBalance();
      console.log("Initial Balance: ", initialBalance);
      console.log(multiSigWallet.target);
      await provider.call({
        to: multiSigWallet.target,
        value: depositValue,
      });

      const newBalance = await multiSigWallet.getBalance();
      console.log("Final Balance: ", newBalance); 
      expect(newBalance).to.greaterThan(initialBalance);
    });
  });
});
