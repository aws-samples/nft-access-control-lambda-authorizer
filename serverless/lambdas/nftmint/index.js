const AWS = require('aws-sdk');
const deployContract = require('./deploy_contract');
const mintNFT = require('./mint_nft');
const uuid = require('uuid')
// const {providers, wallets} = require('onchain-utils')


const METADATA_PREFIX = "metadata"
// Handler
exports.handler = async function(event, context) {
  let responseObject = null;
  try {
    console.log('EVENT', event.body);
    const { requestType } = JSON.parse(event.body);

  switch(requestType.toLowerCase()) {
    case 'deploy':  
      {
        let { tokenName, tokenTicker, baseURI} = JSON.parse(event.body);
        responseObject = await deployContract.deployContract(tokenName, tokenTicker, baseURI);
        break;
    }
    case 'mint': 
      {        
        let {contractAddress, mintAddress, gasLimit, gasPrice, metadata} = JSON.parse(event.body);
        const metadataId = uuid.v4(); // can alternativeley use await getDetails.getTokenId(contractAddress)
        // const fullMetadataUri = `${baseURI}${METADATA_PREFIX}/${metadataId}.json`;
        
        await mintNFT.putMetadata(metadataId, metadata)
        
        //call the mint NFT function
        responseObject = await mintNFT.mintNFT(contractAddress, mintAddress, metadataId, gasLimit, gasPrice)
        responseObject = {id: metadataId, ...responseObject}
        break;
    }
    default:
        responseObject = 'Invalid requestType or parameters';
        break;
    } //switch
  } catch (err) {
    responseObject = err;
  }

  console.log(responseObject);

  return {
     statusCode: 200,
     body: JSON.stringify(responseObject),
     headers: {
       "Content-Type": "application/json"
     }
  }
} 
