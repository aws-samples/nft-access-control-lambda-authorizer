const AWS = require('aws-sdk');
const region = process.env.AWS_DEFAULT_REGION;
const bucketName = process.env.bucketName;
const s3 = new AWS.S3({apiVersion: '2006-03-01'});


exports.handler = async function(event, context)
{
    

}