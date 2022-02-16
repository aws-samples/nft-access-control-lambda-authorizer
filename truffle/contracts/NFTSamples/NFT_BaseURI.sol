// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

// use these imports if using Remix, otherwise use the GitHub links
// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol"; 
import "../Utils/Strings.sol";

/**This contract implements basic ERC721 NFT functionality with auto-incremented token ID's and a method
 * for storing a base URI for off-chain metadata using the format baseURI + "/" + _tokenIdCounter
 * 
 * Provide the uri variable in the constructor in string format. E.g. "https://my-metadata.com/"
 **/
contract NFT_BaseURI is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    using StringsUtils for string;

    Counters.Counter private _tokenIdCounter;
    string baseURI;

    constructor(string memory name, string memory ticker, string memory baseUri) ERC721(name, ticker) {
        _setBaseURI(baseUri);
    }

    function safeMint(address to) public onlyOwner {
        _safeMint(to, _tokenIdCounter.current());
        _tokenIdCounter.increment();
    }

    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 _tokenId = _tokenIdCounter.current();
        safeMint(to);
        _setTokenURI(_tokenId, uri);
    }

    function counter() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    // function tokenURI(uint256 tokenId) public view override returns (string memory) {
    //     string memory current_uri = super.tokenURI(tokenId);
    //     if (!current_uri.contains(".json")) {
    //         current_uri = string(abi.encodePacked(current_uri, ".json"));
    //     }

    //     return current_uri;
    // }
    
    function _setBaseURI(string memory baseURI_) internal {
        baseURI = baseURI_;
    }
    
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }
}
