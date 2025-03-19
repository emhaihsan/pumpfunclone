// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

// Import ERC20 contract from OpenZeppelin library
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Token contract inherits from the ERC20 standard
contract Token is ERC20 {
    // Declare state variables for contract owner and creator
    address payable public owner;
    address public creator;

    // Constructor to initialize the token contract
    constructor(
        address _creator, // Address of the creator
        string memory _name, // Name of the token
        string memory _symbol, // Symbol of the token
        uint256 _totalSupply // Total supply of tokens
    ) ERC20(_name, _symbol) {
        owner = payable(msg.sender); // Set the owner as the address deploying the contract
        creator = _creator; // Set the creator address
        _mint(msg.sender, _totalSupply); // Mint the total supply of tokens to the owner's address
    }
}
