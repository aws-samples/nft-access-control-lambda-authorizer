const AWS = require('aws-sdk');
const mintNFT = require('./mint_nft');
const uuid = require('uuid')

// Handler
exports.handler = async function(event, context) {
  try {
    console.log('EVENT', event.body);
    
    let {contractAddress, mintAddress, gasLimit, gasPrice, metadata} = JSON.parse(event.body);
    const metadataId = uuid.v4();
    
    await mintNFT.putMetadata(metadataId, metadata)
    
    //call the mint NFT function
    let responseObject = await mintNFT.mintNFT(contractAddress, mintAddress, metadataId, gasLimit, gasPrice)
    responseObject = {id: metadataId, ...responseObject}

    return {
      statusCode: 200,
      body: JSON.stringify(responseObject),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
   }
    
  } catch (err) {
    console.error(err)
    throw err;
  }
} 
