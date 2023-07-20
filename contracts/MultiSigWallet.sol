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
        uint256 amount
    );

    event ApprovedWithdrawTx(
        address indexed owner,
        uint256 indexed trasactionIndex
    );

    address[] public owners;

    mapping(address => bool) public isOwner;

    uint256 public quorumRequired;

    struct WidthdrawTxStruct {
        address to;
        uint256 amount;
        uint approvals;
        bool sent;
    }

    mapping(uint => mapping(address => bool)) isApproved;
    WidthdrawTxStruct[] private WidthdrawTxs;

    constructor(address[] memory _owners, uint256 _quorumRequired) {
        require(_owners.length > 0, "At least one owner is required");
        require(
            _quorumRequired > 0 && _quorumRequired <= _owners.length,
            "Invalid number of required quorum"
        );
        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "invalid owner");
            require(!isOwner[owner], "owner not unique");
            isOwner[owner] = true;
            owners.push(owner);
        }
        quorumRequired = _quorumRequired;
    }
    
    // TODO: Declare a function modifier called "onlyOwner" that ensures that the function caller is one of the owners of the wallet
    // TODO: Declare a function modifier called "transactionExists" that ensures that transaction exists in the list of withdraw transactions
    // TODO: Declare a function modifier called "transactionNotApproved" that ensures that transaction has not yet been approved
    // TODO: Declare a function modifier called "transactionNotSent" that ensures that transaction has not yet been sent
}
