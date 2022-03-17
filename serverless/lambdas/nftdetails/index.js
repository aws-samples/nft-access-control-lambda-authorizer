const AWS = require('aws-sdk');
const getDetails = require('./get_details');


// Handler
exports.handler = async function(event, context) {
  let responseObject = null;
try {
    console.log('EVENT', event.body);

    if (!event.requestContext || !event.requestContext.authorizer) {
      return;
    }

    
    const {bucket, contractName } = event.queryStringParameters;
    const {tokenId} = event.pathParameters;
    
    responseObject = await getDetails.getTokenMetadata(tokenId, folderPrefix = contractName)
  
  } catch (err) {
    console.log(err)
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
