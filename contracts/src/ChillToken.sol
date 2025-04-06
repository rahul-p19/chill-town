// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ChillToken is ERC721URIStorage, Ownable(msg.sender) {
    uint256 private nextTokenId = 1;
    uint256 private _totalSupply = 0;
    
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
    event TokenOwnerUpdated(uint256 indexed tokenId, address indexed oldOwner, address indexed newOwner);

    constructor() ERC721("ChillToken", "CLIT") {}

    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Not authorized to mint tokens");
        _;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return super.tokenURI(tokenId);
    }
    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function addMinter(address minter) external onlyOwner {
        require(!minters[minter], "Already a minter");
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    function removeMinter(address minter) external onlyOwner {
        require(minters[minter], "Not a minter");
        minters[minter] = false;
        emit MinterRemoved(minter);
    }

    function isMinter(address account) external view returns (bool) {
        return minters[account] || account == owner();
    }

    function mint(
        address to, 
        string memory description, 
        string memory imageUri, 
        uint256 price, 
        string memory uri
    ) external onlyMinter returns (uint256) {
        uint256 tokenId = nextTokenId++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        tokens[tokenId] = Token({
            description: description,
            imageUri: imageUri,
            price: price,
            owner: to
        });
        
        ownerTokens[to].push(tokenId);
        _totalSupply++;
        
        emit TokenMinted(tokenId, to, description, price);
        
        return tokenId;
    }
    
    function updateTokenPrice(uint256 tokenId, uint256 newPrice) external {
        address owner = _ownerOf(tokenId);
        require(_isAuthorized(owner, _msgSender(), tokenId), "Not owner or approved");
        emit TokenPriceUpdated(tokenId, newPrice);
    }
    
    function getTokenById(uint256 tokenId) external view returns (Token memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return tokens[tokenId];
    }

    function getTokensByOwner(address owner) external view returns (uint256[] memory) {
        return ownerTokens[owner];
    }

    // Override the ERC721 _transfer function to update our custom mappings
    function _transfer(address from, address to, uint256 tokenId) internal override {
        super._transfer(from, to, tokenId);
        
        // Update token owner in our mapping
        tokens[tokenId].owner = to;
        
        // Remove token from previous owner's list
        uint256[] storage fromTokens = ownerTokens[from];
        for (uint256 i = 0; i < fromTokens.length; i++) {
            if (fromTokens[i] == tokenId) {
                // Move the last element to the position of the element to delete
                fromTokens[i] = fromTokens[fromTokens.length - 1];
                // Remove the last element
                fromTokens.pop();
                break;
            }
        }
        
        // Add token to new owner's list
        ownerTokens[to].push(tokenId);
        
        emit TokenOwnerUpdated(tokenId, from, to);
    }

    // Override _burn to maintain total supply
    function _burn(uint256 tokenId) internal override {
        super._burn(tokenId);
        _totalSupply--;
    }
}
