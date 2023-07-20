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
    event Deposit(address indexed sender, uint256 amount, uint256 balance);
    
    event CreatedWithdrawTx(
        address indexed owner,
        uint256 indexed transactionIndex,
        address indexed to,
        uint256 amount);

    event ApprovedWithdrawTx(address indexed owner, uint256 indexed trasactionIndex);

    address[] public owners;

    mapping(address => bool) public isOwner;

    uint256 public quorumRequired = 2;

    struct WidthdrawTxStruct{
        address to;
        uint256 amount;
        uint approvals;
        bool sent;
    }

    mapping(uint => mapping(address => bool)) isApproved;
    WidthdrawTxStruct[] private WidthdrawTxs;

}
