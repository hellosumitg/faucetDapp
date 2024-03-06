// contracts/SkgToken.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

// SkgToken contract inheriting ERC20Capped and ERC20Burnable
contract SkgToken is ERC20Capped, ERC20Burnable {
    // Address of the contract owner
    address payable public owner;
    // Block reward amount
    uint256 public blockReward;

    // Constructor initializing the token with cap and initial reward
    constructor(uint256 cap, uint256 reward)
        ERC20("SkgToken", "SKG")
        ERC20Capped(cap * (10**decimals()))
    {
        owner = payable(msg.sender);
        // Mint initial tokens to the owner
        _mint(owner, 70000000 * (10**decimals()));
        // Set the block reward
        blockReward = reward * (10**decimals());
    }

    // Override internal _mint function to check capped supply
    function _mint(address account, uint256 amount)
        internal
        virtual
        override(ERC20Capped, ERC20)
    {
        require(
            ERC20.totalSupply() + amount <= cap(),
            "ERC20Capped: cap exceeded"
        );
        super._mint(account, amount);
    }

    // Internal function to mint miner reward
    function _mintMinerReward() internal {
        _mint(block.coinbase, blockReward);
    }

    // Hook executed before token transfer
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 value
    ) internal virtual override {
        if (
            from != address(0) &&
            to != block.coinbase &&
            block.coinbase != address(0) &&
            ERC20.totalSupply() + blockReward <= cap()
        ) {
            _mintMinerReward();
        }
        super._beforeTokenTransfer(from, to, value);
    }

    // Function to set block reward, accessible only by the owner
    function setBlockReward(uint256 reward) public onlyOwner {
        blockReward = reward * (10**decimals());
    }

    // Function to destroy the contract, transferring remaining ether to the owner
    function destroy() public onlyOwner {
        selfdestruct(owner);
    }

    // Modifier to restrict access to owner-only functions
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }
}
