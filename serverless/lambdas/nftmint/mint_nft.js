const AWS = require('aws-sdk');
const ethers = require('ethers');
const {providers, wallets, samples} = require('onchain-utils')

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
    const provider = await providers.getProvider()
    const myWallet = await wallets.getAWSWallet(provider)

    //create an instance of the contract
    const { abi } = samples.baseWithMetadata;

    //attaching to a deployed contract and interacting with your contract
    const erc721 = new ethers.Contract(contractAddress, abi, myWallet)

    try {
      var options = { gasPrice, gasLimit };
      const mintResult  = await erc721['safeMint(address,string)'](mintAddress, metadataUrl, options)
        
      console.log("mint result", mintResult)

      return {
        "txHash": mintResult.hash
      }

    } catch (error) {
      return {"Minting Error": error};
    }
  }
module.exports = { mintNFT, putMetadata }
