const AWS = require('aws-sdk');
const deployContract = require('./deploy_contract');
const mintNFT = require('./mint_nft');
const getDetails = require('./get_details');
const uuid = require('uuid')
// import { v4 as uuidv4 } from 'uuid';
// const region = process.env.AWS_DEFAULT_REGION;
const bucketName = process.env.bucketName;
const s3 = new AWS.S3({apiVersion: '2006-03-01'});


const METADATA_PREFIX = "metadata"
// Handler
exports.handler = async function(event, context) {
  let responseObject = null;
try {
    console.log('EVENT', event.body);

    let  {contractAddress, tokenID} = JSON.parse(event.body);

    //call the get owner function
    responseObject = await getDetails.getTokenDetails(contractAddress, tokenID)
    // responseObject = {
    //   owner,
    //   uri: `${uri}.json`
    // } 
  
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
