const AWSHttpProvider = require('./aws-web3-http-provider');
const utils  = require('./utils');
const ethers = require('ethers');
const AWS = require('aws-sdk');

const nodeId = process.env.nodeId;
const networkId = process.env.networkId;
const bucketName = process.env.bucketName;
const METADATA_PREFIX = "metadata"

const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const getTokenId = async (contractAddress) => {
  let endpoint = await utils.getHTTPendpoint(nodeId,networkId)
  endpoint = `https://${endpoint}`;
  const baseProvider = new AWSHttpProvider(endpoint);
  const provider = new ethers.providers.Web3Provider(baseProvider);

  //  retrieve the pvt key from ssm and generate a wallet address

  const pvtKey = await utils.getSSMParam(process.env.pvtkey);
  const  myWallet = new ethers.Wallet(pvtKey, provider);

  //create an instance of the contract
  const abi = require('./NFTSamples/NFT_BaseURI.json').abi;

  //attaching to a deployed contract and interacting with your contract
  const erc721 = new ethers.Contract(contractAddress, abi, myWallet);
  try {
  const tokenId = await erc721.counter()
  return tokenId;
    } catch (error) {
   return {"Error": error};
  }
}

const getTokenOnChainDetails = async (contractAddress, tokenID) => {
    let endpoint = await utils.getHTTPendpoint(nodeId,networkId)
    endpoint = `https://${endpoint}`;
    const baseProvider = new AWSHttpProvider(endpoint);
    const provider = new ethers.providers.Web3Provider(baseProvider);

//  retrieve the pvt key from ssm and generate a wallet address

    const pvtKey = await utils.getSSMParam(process.env.pvtkey);
    const  myWallet = new ethers.Wallet(pvtKey, provider);

    //create an instance of the contract
    const abi = require('./NFTSamples/NFT_BaseURI.json').abi;

    //attaching to a deployed contract and interacting with your contract
    const erc721 = new ethers.Contract(contractAddress, abi, myWallet);
    try {
    const owner = await erc721.ownerOf(tokenID);
    const uri = await erc721.tokenURI(tokenID)
    return {owner, uri};
      } catch (error) {
     return {"Error": error};
    }
  }
  
const getTokenMetadata = async (tokenId, folderPrefix = METADATA_PREFIX, bucket = bucketName) => {
  const fileParams = {  
    Bucket: bucketName,
    // ACL: 'public-read',
    Key: `${folderPrefix}/${tokenId}.json`,
  };

  const obj = await s3.getObject(fileParams).promise()
  return JSON.parse(obj.Body.toString('utf-8'))
}

module.exports = {getTokenOnChainDetails, getTokenId, getTokenMetadata}