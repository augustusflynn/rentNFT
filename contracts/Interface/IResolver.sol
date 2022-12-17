// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

interface IResolver {
    function getPaymentToken(string memory _name)
        external
        view
        returns (address);

    function setPaymentToken(string memory _name, address _v) external;
}
