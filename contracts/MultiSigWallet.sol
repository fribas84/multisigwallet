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

    WidthdrawTxStruct[] private widthdrawTxs;

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

    modifier onlyOwner(){
        require(isOwner[msg.sender],"not owner");
        _;
    }
    
    modifier transactionExists(uint256 _transactionIndex){
        if(_transactionIndex > widthdrawTxs.length){
            revert TxNotExists(_transactionIndex);
        }
        _;
    }

    modifier transactionNotApproved(uint256 _transactionIndex){
        if(isApproved[_transactionIndex][msg.sender]){
            revert TxAlreadyApproved(_transactionIndex);
        }
        _;
    }
    // TODO: Declare a function modifier called "transactionNotSent" that ensures that transaction has not yet been sent
    modifier transactionNotSent(uint256 _transactionIndex){
        if(widthdrawTxs[_transactionIndex].sent){
            revert TxAlreadySent(_transactionIndex);
        }
        _;
    }

    function createdWithdrawTx(address _to, uint256 _amount) external onlyOwner {
        require(_amount>0,"invalid amount to withdraw");
        uint256 transactionIndex = widthdrawTxs.length;
        widthdrawTxs.push(WidthdrawTxStruct(
            _to,
            _amount,
            0,
            false
        ));
        emit createdWithdrawTx(
            msg.sender,
            transactionIndex,
            _to,
            _amount);
    }
}


    /* TODO: Create a function called "createWithdrawTx" that is used to initiate the withdrawal 
             of ETH from the multisig smart contract wallet and does the following:
             1) Ensures that only one of the owners can call this function
             2) Create the new withdraw transaction(to, amount, approvals, sent) and add it to the list of withdraw transactions
             3) Emit an event called "CreateWithdrawTx"
    */
    /* TODO: Create a function called "approveWithdrawTx" that is used to approve the withdraw a particular transaction
             based on the transactionIndex(this is the index of the array of withdraw transactions)
             This function does the following:
             1) Ensures that only one of the owners can call this function
             2) Ensures that the withdraw transaction exists in the array of withdraw transactions
             3) Ensures that the withdraw transaction has not been approved yet
             4) Ensures that the withdraw transaction has not been sent yet 
             5) Incremement the number of approvals for the given transaction
             6) Set the value of "isApproved" to be true for this transaction and for this caller
             7) If the numhber of approvals is greater than or equal to the number of quorum required, do the following:
                  - Set the value of "sent" of this withdraw transaction to be true
                  - Transfer the appropriate amount of ETH from the multisig wallet to the receiver
                  - Ensure that the transfer transaction was successful
                  - Emit an event called "ApproveWithdrawTx"
    */
    /* TODO: Create a function called "deposit" that will handle the receiving of ETH to this multisig wallet 
             Make sure to emit an event called "Deposit"
    */
    // TODO: You may also want to implement a special function called "receive" to handle the receiving of ETH if you choose
    // modifier onlyOwner()
}