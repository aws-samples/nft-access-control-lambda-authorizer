const AWS = require('aws-sdk');
const deployContract = require('./deploy_contract');

// Handler
exports.handler = async function(event, context) {
  try {
    console.log('EVENT', event.body);
    let { tokenName, tokenTicker, baseURI} = JSON.parse(event.body);
    const responseObject = await deployContract.deployContract(tokenName, tokenTicker, baseURI);
    console.log(responseObject);
    
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
