const { S3Client } = require('@aws-sdk/client-s3')
const multer = require('multer');
const multerS3 = require('multer-s3')

const s3 = new S3Client({
  region: process.env.aws_region,
  credentials: {
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key,
  }
})

// //  TO MAKE AWS BUCKET!
// const bucketParams = { Bucket: 'yelp-camp-bucket', ACL: "public-read" };

// const makeBucket = async () => {
//   try {
//     const data = await s3.send(new CreateBucketCommand(bucketParams));
//     console.log("Success", data);
//     return data; // For unit tests.
//   } catch (err) {
//     console.log("Error", err);
//   }
// };
// makeBucket();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'yelp-camp-bucket',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
  })
})

module.exports = { s3, upload}