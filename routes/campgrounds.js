const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds')
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const ExpressError = require('../utils/ExpressError');
const { Router } = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3')
const { S3Client, CreateBucketCommand, PutBucketAclCommand } = require('@aws-sdk/client-s3')


if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
} 

const s3 = new S3Client({
  region: 'eu-central-1',
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

router.route('/')
  .get(catchAsync(campgrounds.index))
  .post(isLoggedIn,  upload.array('image'),validateCampground, catchAsync(campgrounds.newPost))
  // .post(upload.array('image'), (req, res) => {
  //   // // res.send doesn't support multiple variables
  //   // console.log(req.body, req.files);

  // })

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
  .get(catchAsync(campgrounds.getId))
  .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.putId))
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteId));



router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.idEdit))

// Why put? To follow REST

module.exports = router;