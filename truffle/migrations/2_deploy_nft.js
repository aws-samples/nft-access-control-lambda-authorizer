const NFT = artifacts.require("NFT_BaseURI");

module.exports = function (deployer) {
  deployer.deploy(NFT, "mzNFT", "maze", "https://d3i60wwbxl0tk7.cloudfront.net/metadata/");
};
