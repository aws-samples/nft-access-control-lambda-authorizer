// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

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

const mintNFT = async (contractAddress, mintAddress, metadataUrl, gasLimit = 100000, gasPrice = 100000000000, waitForTx=true) => {
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

      if (waitForTx && Number(waitForTx) > 0) {
        const mintReceipt = await mintResult.wait(Number(waitForTx))
        console.log(`mint receipt: ${JSON.stringify(mintReceipt)}`)

        if (mintReceipt.logs && mintReceipt.logs[0].topics.length == 4) { // relies on event emitted by the default contract
          const tokenIdBigNumber = mintReceipt.logs[0].topics[3]
          const tokenId = ethers.BigNumber.from(tokenIdBigNumber).toNumber()
          return {
            txHash: mintResult.hash,
            tokenId: tokenId,
            blockNumber: mintReceipt.blockNumber
          }
        }
        
      }

      return {
        "txHash": mintResult.hash
      }

    } catch (error) {
      console.error(error)
      return { "Minting Error": error};
    }
  }
module.exports = { mintNFT, putMetadata }
