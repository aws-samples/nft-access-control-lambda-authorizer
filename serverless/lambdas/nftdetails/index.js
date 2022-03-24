const AWS = require('aws-sdk');
const getDetails = require('./get_details');


// Handler
exports.handler = async function(event, context) {
  let responseObject = null;
try {
    // console.log(`event: ${JSON.stringify(event)}, context: ${JSON.stringify(context)}`)
    if (!event.requestContext || !event.requestContext.authorizer) {
      throw "no requestContext";
    }
    const {contractAddress, tokenId} = event.requestContext.authorizer
    const {metadata} = event.pathParameters;
    console.log(`token: ${tokenId}, contract: ${contractAddress}, metadata: ${metadata}`)

    // const {uri, owner} = await getDetails.getTokenOnChainDetails(contractAddress, tokenId)
    // console.log(`nft uri: ${uri}`)
    // const lastSegment = uri.split("/").pop();

    responseObject = await getDetails.getTokenMetadata(metadata)
  
  } catch (err) {
    console.log(err)
    responseObject = err;
  }

  return {
     statusCode: 200,
     body: JSON.stringify(responseObject),
     headers: {
       "Content-Type": "application/json"
     }
  }
} 
