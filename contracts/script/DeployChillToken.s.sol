// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/ChillToken.sol";

contract ChillTokenScript is Script {
    function run() external {

        vm.startBroadcast();

        ChillToken chillToken = new ChillToken();

        console.log("ChillToken deployed at:", address(chillToken));

        vm.stopBroadcast();
    }
}

//Contract Address: 0xDe10B8ba9D8D15EDcD6553cA2DbA489f3dd95944