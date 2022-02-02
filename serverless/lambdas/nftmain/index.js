const AWS = require('aws-sdk');
const deployContract = require('./deploy_contract');
const mintNFT = require('./mint_nft');
const getDetails = require('./get_details');
const region = process.env.AWS_DEFAULT_REGION;
const bucketName = process.env.bucketName;
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

// Handler
exports.handler = async function(event, context) {
  let responseObject = null;
try {
  console.log('EVENT', event.body);
  const requestType = JSON.parse(event.body).requestType;

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
          const tokenId = await getDetails.getTokenId(contractAddress)
          
          const fileParams = {  
            Bucket: bucketName,
            // ACL: 'public-read',
            Key: `${tokenId}.json`,
            Body: JSON.stringify(metadata.item)
          };

          //
          //store the metadata file for the NFT in an S3 bucket
          await s3.putObject(fileParams).promise();

          //call the mint NFT function
          responseObject = await mintNFT.mintNFT(contractAddress, mintAddress, gasLimit, gasPrice)
         break;
      }
      case 'details':
      {
          let  {contractAddress, tokenID} = JSON.parse(event.body);
          //call the get owner function
          responseObject = await getDetails.getTokenDetails(contractAddress, tokenID)
          // responseObject = {
          //   owner,
          //   uri: `${uri}.json`
          // } 
          break;
      }
      default:
          responseObject = 'Invalid requestType or parameters';
          break;
  } //switch
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
