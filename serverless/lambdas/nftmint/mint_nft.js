const AWS = require('aws-sdk');
const AWSHttpProvider = require('./aws-web3-http-provider');
const utils  = require('./utils');
const ethers = require('ethers');
const uuid = require('uuid')

const nodeId = process.env.nodeId;
const networkId = process.env.networkId;
const bucketName = process.env.bucketName;
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const putMetadata = async (id, contents, bucket = bucketName, folderPrefix = "metadata") => {
  const fileParams = {  
    Bucket: bucket,
    // ACL: 'public-read',
    Key: `${folderPrefix}/${id}.json`,
    Body: JSON.stringify(contents)
  };
  //store the metadata file for the NFT in an S3 bucket
  await s3.putObject(fileParams).promise();

}

const mintNFT = async (contractAddress, mintAddress, metadataUrl, gasLimit = 100000, gasPrice = 100000000000) => {
    let endpoint = await utils.getHTTPendpoint(nodeId,networkId)
    endpoint = `https://${endpoint}`
    const baseProvider = new AWSHttpProvider(endpoint);
    const provider = new ethers.providers.Web3Provider(baseProvider);

    //  retrieve the pvt key from ssm and generate a wallet address
    const pvtKey = await utils.getSSMParam(process.env.pvtkey)
    const myWallet = new ethers.Wallet(pvtKey, provider);

    //create an instance of the contract
    const abi = require('./NFTSamples/NFT_BaseURI.json').abi;

    //attaching to a deployed contract and interacting with your contract
    const erc721 = new ethers.Contract(contractAddress, abi, myWallet)

    try {
      var options = { gasPrice, gasLimit };
      // const [mintId, mintResult] = 
        // await Promise.all([erc721.counter(options), erc721['safeMint(address,string)'](mintAddress, metadataUrl, options)])
        
      const mintResult  = await erc721['safeMint(address,string)'](mintAddress, metadataUrl, options)
      // const tokenURI= await erc721.tokenURI(mintId, options)
        
      console.log("mint result", mintResult)

      return {
        "txHash": mintResult.hash,
        // "tokenId": mintId.toNumber(), "tokenURI": tokenURI
      }

    } catch (error) {
      return {"Minting Error": error};
    }
  }
module.exports = { mintNFT, putMetadata }
