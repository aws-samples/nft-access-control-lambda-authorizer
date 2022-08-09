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
    const {contractAddress, tokenId, metadataId} = event.requestContext.authorizer
    console.log(`token: ${tokenId}, contract: ${contractAddress}, metadata: ${metadataId}`)

    responseObject = await getDetails.getTokenMetadata(metadataId)
  
  } catch (err) {
    console.log(err)
    responseObject = err;
  }

  return {
     statusCode: 200,
     body: JSON.stringify(responseObject),
     headers: {
       "Content-Type": "application/json",
       "Access-Control-Allow-Origin": "*"
     }
  }
} 
