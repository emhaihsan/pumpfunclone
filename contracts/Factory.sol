// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import {Token} from "./Token.sol";

contract Factory {
    uint256 public constant TARGET = 3 ether;
    uint256 public constant TOKEN_LIMIT = 500_000 ether;
    uint256 public immutable fee;
    address public owner;

    uint256 public totalTokens;
    address[] public tokens;

    struct TokenSale {
        address token;
        string name;
        address creator;
        uint256 sold;
        uint256 raised;
        bool isOpen;
    }

    event Created(address contractAddress);
    event Buy(address token, uint256 amount);
    mapping(address => TokenSale) public tokenToSale;

    constructor(uint256 _fee) {
        fee = _fee;
        owner = msg.sender;
    }

    function getTokenSale(
        uint256 _index
    ) public view returns (TokenSale memory) {
        return tokenToSale[tokens[_index]];
    }

    // File: contracts/Factory.sol
    function getCost(uint256 _sold) public pure returns (uint256) {
        uint256 floor = 0.0001 ether;
        uint256 step = 0.0001 ether;
        uint256 increment = 10000 ether;

        uint256 cost = (step * (_sold / increment)) + floor;
        return cost;
    }

    function create(
        string memory _name,
        string memory _symbol
    ) external payable {
        require(msg.value >= fee, "Factory: creator fee not met");
        // Create a new token
        Token token = new Token(msg.sender, _name, _symbol, 1_000_000 ether);
        // Save the token for later use
        tokens.push(address(token));

        totalTokens++;

        // list token on the market
        TokenSale memory tokenSale = TokenSale(
            address(token),
            _name,
            msg.sender,
            0,
            0,
            true
        );
        tokenToSale[address(token)] = tokenSale;

        emit Created(address(token));
    }

    function buy(address _token, uint256 _amount) external payable {
        TokenSale storage sale = tokenToSale[_token];

        // calculate the price of 1 token based upon total bought
        require(sale.isOpen, "Factory: token is not for sale");
        require(_amount >= 1, "Factory: amount too low");
        require(_amount <= 10000 ether, "Factory: Amount exceeded");

        uint256 cost = getCost(sale.sold);
        uint256 price = (cost * _amount) / 10 ** 18;

        // make sure enough eth is
        require(msg.value >= price, "Factory: not enough eth sent");

        // update the sale;
        sale.sold += _amount;
        sale.raised += price;

        if (sale.sold >= TOKEN_LIMIT || sale.raised >= TARGET) {
            sale.isOpen = false;
        }
        Token(_token).transfer(msg.sender, _amount);

        emit Buy(_token, _amount);
    }

    function deposit(address _token) external {
        // The remaining token balance and the ETH raised
        // would go into a liquidity pool like Uniswap V3
        // For simplicity we'll just transfer remaining
        // tokens and ETH raised to the creator.

        Token token = Token(_token);
        TokenSale memory sale = tokenToSale[_token];

        require(sale.isOpen == false, "Factory: target not reached");

        uint256 remainingTokens = token.balanceOf(address(this));
        uint256 raised = sale.raised;
        address creator = sale.creator;

        token.transfer(creator, remainingTokens);

        (bool success, ) = payable(creator).call{value: raised}("");
        require(success, "Factory: failed to send ETH");
    }

    function withdraw(uint256 _amount) external {
        require(msg.sender == owner, "Factory: only owner");
        (bool success, ) = payable(owner).call{value: _amount}("");
        require(success, "Factory: failed to send ETH");
    }
}
