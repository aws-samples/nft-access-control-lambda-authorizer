// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const AWS = require('aws-sdk');

const bucketName = process.env.bucketName;
const METADATA_PREFIX = "metadata"

const s3 = new AWS.S3({apiVersion: '2006-03-01'});
  
const getTokenMetadata = async (metadataId, folderPrefix = METADATA_PREFIX, bucket = bucketName) => {
  console.log(`metadata:${metadataId}, folder: ${folderPrefix}, bucket: ${bucket} `)
  const fileParams = {  
    Bucket: bucket,
    // ACL: 'public-read',
    Key: `${folderPrefix}/${metadataId}.json`,
  };

  const obj = await s3.getObject(fileParams).promise()
  return JSON.parse(obj.Body.toString('utf-8'))
}

module.exports = { getTokenMetadata }