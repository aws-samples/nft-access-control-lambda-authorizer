const NFT = artifacts.require("NFT_BaseURI");

module.exports = function (deployer) {
  deployer.deploy(NFT, "mzNFT", "maze", "https://49drke25p0.execute-api.us-east-1.amazonaws.com/nftapi/assets/");
};
