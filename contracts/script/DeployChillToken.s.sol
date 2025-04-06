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

//Contract Address: 0x0Af39c275ed7698F6e5b4C676F3396db88Db5ED9
