pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/ChillToken.sol";

contract MintChillToken is Script {
    function run() external {
        address contractAddress = 0x0Af39c275ed7698F6e5b4C676F3396db88Db5ED9;
        address to = 0x424bBA2a6f1c14e4D8e2Cf1bCAE1B06740Fa4755;
        string memory description = "This token is the first avatar";
        string memory imageUri = "ipfs://bafkreidk42gcnifgom4uqc74huhqvxz72yjfdshjqjkwukow3oiwnuku7e";
        uint256 price = 0.01 ether;
        string memory tokenURI = "ipfs://bafkreidk42gcnifgom4uqc74huhqvxz72yjfdshjqjkwukow3oiwnuku7e";
        vm.startBroadcast();

        // ChillToken chillToken = new ChillToken();
        ChillToken chillToken = ChillToken(contractAddress);
        uint256 tokenId = chillToken.mint(to, description, imageUri, price, tokenURI);

        console.log("Minted ChillToken with ID:", tokenId);
        console.log("ChillToken deployed at:", address(chillToken));

        vm.stopBroadcast();
    }
}