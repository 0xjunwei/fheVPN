// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract MintableERC is ERC20, Ownable, ERC20Permit {
    constructor()
        ERC20("USDC", "USD")
        Ownable(msg.sender)
        ERC20Permit("USDC")
    {}

    // Testnet token will allow anyone to mint, please dont use this code
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    // Override the decimals function to return the desired number of decimals (e.g., 6) matches usdc
    function decimals() public view override returns (uint8) {
        return 6;
    }
}
