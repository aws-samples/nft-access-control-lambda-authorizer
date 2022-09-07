// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const AWS = require('aws-sdk');
const {providers, tokenUtils, samples} = require('onchain-utils')

// Handler
exports.handler = async function(event, context) {
  try {
    let {contract, tokenId} = event.queryStringParameters;

    // Getting the AWS provider (AMB)
    const provider = await providers.getProvider()

    // Get the NFT ABI
    const { abi } = samples.baseWithMetadata;

    const { owner, uri } = await tokenUtils.getTokenOnChainDetails(provider, abi, contract, tokenId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        contract,
        tokenId,
        owner,
        uri
      }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    }
    
  } catch (err) {
    console.log(err)
    
    return {
      statusCode: 500,
      body: JSON.stringify(err),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    }

  }
} 
