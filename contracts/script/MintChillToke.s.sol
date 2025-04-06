pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/ChillToken.sol";

contract MintChillToken is Script {
    function run() external {
        address to = 0x0Af39c275ed7698F6e5b4C676F3396db88Db5ED9;
        string memory description = "This token is the first avatar";
        string memory imageUri = "https://example.com/image.png";
        uint256 price = 1 ether;
        string memory tokenURI = "https://example.com/token.json";

        vm.startBroadcast();

        ChillToken chillToken = new ChillToken();
        uint256 tokenId = chillToken.mint(to, description, imageUri, price, tokenURI);

        console.log("Minted ChillToken with ID:", tokenId);
        console.log("ChillToken deployed at:", address(chillToken));

        vm.stopBroadcast();
    }
}