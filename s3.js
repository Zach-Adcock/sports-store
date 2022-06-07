const S3 = require('aws-sdk/clients/s3');
require('dotenv').config();
const fs = require('fs');

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accesKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3({
  region,
  accesKeyId,
  secretAccessKey
})


//Function to upload file (photo) to S3
const uploadFile = (file) => {
  const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file.filename
  };

  return s3.upload(uploadParams).promise()
}
exports.uploadFile = uploadFile;

// deletes the file from s3
const deleteFile = (fileKey) => {
  const deleteParams = {
    Bucket: bucketName,
    Key: fileKey,
  };

  return s3.deleteObject(deleteParams).promise();
}
exports.deleteFile = deleteFile;

//Function to download file (photo) to S3