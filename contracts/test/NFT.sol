// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFT is ERC721 {
    address public owner;
    uint256 public tokenCounter = 1;

    constructor(string memory name_, string memory symbol_)
        ERC721(name_, symbol_)
    {
        owner = msg.sender;
    }

    function mint(uint256 _amount) external {
        for (uint256 i = 0; i < _amount; i++) {
            _mint(msg.sender, tokenCounter);
            tokenCounter++;
        }
    }
}
