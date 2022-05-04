const AWS = require('aws-sdk');
const { ethers } = require('ethers');
const {providers, tokenUtils, samples} = require('onchain-utils')
const {getPolicy} = require('./policy')

const re = /([a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})/i;
/*
* Copyright 2015-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
*
*     http://aws.amazon.com/apache2.0/
*
* or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/


exports.handler = async function(event, context) {
    // Do not print the auth token unless absolutely necessary
    // console.log('Client token: ' + event.authorizationToken);
    console.log('Event: ' + JSON.stringify(event));

    const signBuff = Buffer.from(event.authorizationToken, 'base64')
    const signature = JSON.parse(signBuff.toString())
    
    const resultAddress = ethers.utils.verifyMessage(signature.message, signature.signature)

    console.log(`signature address:${resultAddress}, event address:${signature.address}`)
    
    // Set the signature address as the principal for the request
    var principalId = signature.address
    if (resultAddress != signature.address) {
      throw new Error("Unauthorized")
    }
    
    const messageDetails = JSON.parse(signature.message)

    if (!messageDetails.contractAddress) {
      throw new Error("No contract address specified");
    }

    // Getting the AWS provider (AMB)
    const provider = await providers.getProvider()
    
    // Get the NFT ABI
    const { abi } = samples.baseWithMetadata;

    const { owner, uri } = await tokenUtils.getTokenOnChainDetails(provider, abi, messageDetails.contractAddress, messageDetails.tokenId)

    console.log(`Request token: ${messageDetails.tokenId}, metadataId: ${messageDetails.metadataId}, token uri: ${uri}, contract address: ${messageDetails.contractAddress}, token Owner: ${owner.toString()}, signature address: ${signature.address}`)
    
    const uriMatch = re.exec(uri)
    const uriMetadataId =  uriMatch ? uriMatch[1] : null;
    
    if (uriMetadataId != messageDetails.metadataId) {
      throw new Error("metadata doesn't match")
    }
    
    // if access is denied, the client will receive a 403 Access Denied response
    // if access is allowed, API Gateway will proceed with the backend integration configured on the method that was called
    const authResponse = getPolicy(event.methodArn, principalId, owner.toString() != signature.address)

    // // new! -- add additional key-value pairs
    // // these are made available by APIGW like so: $context.authorizer.<key>
    // // additional context is cached
    authResponse.context = {
      owner: owner.toString(),
      contractAddress : messageDetails.contractAddress,
      tokenId : messageDetails.tokenId,
      metadataId: messageDetails.metadataId,
      uri: uri.toString()
    };

    return authResponse
  } 
