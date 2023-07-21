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

    function getOwners() view external returns( address[] memory){
        return owners;
    } 

    function createdWithdrawTx(
        address _to,
        uint256 _amount
    ) external onlyOwner {
        require(_amount > 0, "invalid amount to withdraw");
        uint256 transactionIndex = widthdrawTxs.length;
        widthdrawTxs.push(WidthdrawTxStruct(_to, _amount, 0, false));
        emit CreatedWithdrawTx(msg.sender, transactionIndex, _to, _amount);
    }

    function approveWithdrawTx(
        uint256 _transactionIndex
    ) 
        external
        onlyOwner
        transactionExists(_transactionIndex)
        transactionNotApproved(_transactionIndex)
        transactionNotSent(_transactionIndex)

    {
        WidthdrawTxStruct storage widthdrawTx = widthdrawTxs[_transactionIndex];
        widthdrawTx.approvals +=1;
        isApproved[_transactionIndex][msg.sender] = true;
        if(widthdrawTx.approvals >= quorumRequired){
            widthdrawTx.sent = true;
            (bool success, ) = widthdrawTx.to.call{value: widthdrawTx.amount}("");
            require(success,"transaction failed");
            emit ApprovedWithdrawTx(msg.sender, _transactionIndex);
        }
    }

    function deposit() external payable  {
        emit Deposit(msg.sender,msg.value,address(this).balance);
    }

    function getBalance() external view returns (uint256){
        return address(this).balance;
    }
    
    receive() external payable {
        emit Deposit(msg.sender,msg.value,address(this).balance);
    }

    fallback() external payable {
        emit Deposit(msg.sender,msg.value,address(this).balance);
    }

        modifier onlyOwner() {
        require(isOwner[msg.sender], "not owner");
        _;
    }

    modifier transactionExists(uint256 _transactionIndex) {
        if (_transactionIndex > widthdrawTxs.length) {
            revert TxNotExists(_transactionIndex);
        }
        _;
    }

    modifier transactionNotApproved(uint256 _transactionIndex) {
        if (isApproved[_transactionIndex][msg.sender]) {
            revert TxAlreadyApproved(_transactionIndex);
        }
        _;
    }
    modifier transactionNotSent(uint256 _transactionIndex) {
        if (widthdrawTxs[_transactionIndex].sent) {
            revert TxAlreadySent(_transactionIndex);
        }
        _;
    }
}