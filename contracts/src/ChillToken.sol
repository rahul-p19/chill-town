// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract ChillToken is ERC721URIStorage, Ownable {
    uint256 private nextTokenId = 1;
    
    struct Token {
        string description;
        string imageUri;
        uint256 price;
        address owner;
    }

    mapping(uint256 => Token) private tokens;
    mapping(address => bool) private minters;
    mapping(address => uint256[]) private ownerTokens;


    event TokenMinted(uint256 indexed tokenId, address indexed owner, string description, uint256 price);
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event TokenPriceUpdated(uint256 indexed tokenId, uint256 newPrice);


    constructor() ERC721("ChillToken", "CLIT") Ownable(msg.sender) {}

    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }

    function addMinter(address minter) external onlyMinter {
        require(minter != address(0), "Invalid address");
        require(!minters[minter], "Already a minter");
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    function removeMinter(address minter) external onlyMinter {
        require(minters[minter], "Not a minter");
        minters[minter] = false;
        emit MinterRemoved(minter);
    }

    function isMinter(address account) external view returns (bool) {
        return minters[account];
    }

    function mint(
        address to, 
        string memory description, 
        string memory imageUri, 
        uint256 price, 
        string memory tokenURI
    ) external onlyMinter returns (uint256) {
        uint256 tokenId = nextTokenId++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        tokens[tokenId] = Token({
            description: description,
            imageUri: imageUri,
            price: price,
            owner: to
        });
        
        ownerTokens[to].push(tokenId);
        
        emit TokenMinted(tokenId, to, description, price);
        
        return tokenId;
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        require(_exists(tokenId), "ERC721: operator query for nonexistent token");
        address owner = ownerOf(tokenId);
        return (spender == owner || getApproved(tokenId) == spender || isApprovedForAll(owner, spender));
    }

    function updateTokenPrice(uint256 tokenId, uint256 newPrice) external {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not owner or approved");
        tokens[tokenId].price = newPrice;
        emit TokenPriceUpdated(tokenId, newPrice);
    }
    
    function getTokenById(uint256 tokenId) external view returns (Token memory) {
        require(_exists(tokenId), "Token does not exist");
        return tokens[tokenId];
    }

    function getTokensByOwner(address owner) external view returns (uint256[] memory) {
        return ownerTokens[owner];
    }

    function _transfer(address from, address to, uint256 tokenId) internal override {
        super._transfer(from, to, tokenId);
        tokens[tokenId].owner = to;
        uint256[] storage fromTokens = ownerTokens[from];
        for (uint256 i = 0; i < fromTokens.length; i++) {
            if (fromTokens[i] == tokenId) {
                fromTokens[i] = fromTokens[fromTokens.length - 1];
                fromTokens.pop();
                break;
            }
        }
        
        ownerTokens[to].push(tokenId);
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return tokenId > 0 && tokenId < nextTokenId;
    }

}