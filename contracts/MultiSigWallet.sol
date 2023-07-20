// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/// This error will be thrown whenever the user tries to approve a transaction that does not exist.
/// @param transactionIndex.
error TxNotExists(uint256 transactionIndex);

/// This error will be thrown whenever the user tries to approve a transaction that has already been approved.
/// @param transactionIndex.
error TxAlreadyApproved(uint256 transactionIndex);

/// This error will be thrown whenever the user tries to approve a transaction that has already been sent.
/// @param transactionIndex.
error TxAlreadySent(uint256 transactionIndex);

contract MultiSigWallet {
    event Deposit(address indexed origin, uint256 amount);
    event CreatedWithdrawTx(uint256 indexed transactionIndex, uint256 amount);
    event ApprovedWithdrawTx(uint256 indexed trasactionIndex);

    address[] private owners;
    mapping(address => bool) isOwner;

    uint256 private quorumRequired = 2;

    struct WidthdrawTxStruct{
        address to;
        uint256 amount;
        address[] approvals;
        bool sent;
    }

    mapping(uint=>mapping(address=>bool)) isApproved;
    WidthdrawTxStruct[] private WidthdrawTx;

}
