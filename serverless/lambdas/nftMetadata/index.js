// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const AWS = require('aws-sdk');
const metadata = require('./metadata');

// Handler
exports.handler = async function(event, context) {
  let responseObject = null;
try {
    if (!event.requestContext || !event.requestContext.authorizer) {
      throw "no requestContext";
    }
    const {contractAddress, tokenId, metadataId} = event.requestContext.authorizer
    console.log(`token: ${tokenId}, contract: ${contractAddress}, metadata: ${metadataId}`)

    responseObject = await metadata.getTokenMetadata(metadataId)
  
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
