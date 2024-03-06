// contracts/Faucet.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

// Interface for ERC20 token
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);

    function balanceOf(address account) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    // here `indexed` keyword in `event` means basically is that you can search by these `parameter` names in event logs after these events are fired so that's just something that helps you basically search the logs and you can have up to three `indexed` `parameters` per `event`
}

// Faucet contract
contract Faucet {
    // Owner of the faucet
    address payable owner;
    // ERC20 token interface
    IERC20 public token;
    // Withdrawal amount
    uint256 public withdrawalAmount = 50 * (10 ** 18);
    // Lock time for withdrawal
    uint256 public lockTime = 5 minutes;
    // Event emitted on withdrawal
    event Withdrawal(address indexed to, uint256 indexed amount);
    // Event emitted on deposit
    event Deposit(address indexed from, uint256 indexed amount);
    // Mapping to track next access time for each address
    mapping(address => uint256) nextAccessTime;

    // Constructor to initialize faucet with a token address
    constructor(address tokenAddress) payable {
        token = IERC20(tokenAddress);
        owner = payable(msg.sender);
    }

    // Function to request tokens from the faucet
    function requestTokens() public {
        require(
            msg.sender != address(0),
            "Request must not originate from a zero account (i.e invalid address)"
        );
        require(
            // below `this` means address of this `faucet contract`
            token.balanceOf(address(this)) >= withdrawalAmount,
            "Insufficient balance in faucet for withdrawal request"
        );
        require(
            block.timestamp >= nextAccessTime[msg.sender],
            "Insufficient time elapsed since last withdrawal - try again later."
        );

        nextAccessTime[msg.sender] = block.timestamp + lockTime;

        token.transfer(msg.sender, withdrawalAmount);
    }

    // Fallback function to accept ether deposits
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    // Function to get the balance of the faucet
    function getBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    // Function to set the withdrawal amount, accessible only by the owner
    function setWithdrawalAmount(uint256 amount) public onlyOwner {
        withdrawalAmount = amount * (10 ** 18);
    }

    // Function to set the lock time for withdrawals, accessible only by the owner
    function setLockTime(uint256 amount) public onlyOwner {
        lockTime = amount * 1 minutes;
    }

    // Function to withdraw remaining tokens from the faucet, accessible only by the owner
    function withdraw() external onlyOwner {
        emit Withdrawal(msg.sender, token.balanceOf(address(this)));
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }

    // Modifier to restrict access to owner-only functions
    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only the contract owner can call this function"
        );
        _;
    }
}
