const campground = require('../models/campground')
const Campground = require('../models/campground')
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });


module.exports.index = async (req, res) => {
  const camps = await Campground.find({})
  res.render('campgrounds/index', { camps })
}

module.exports.renderNewForm = (req, res) => {
  res.render('campgrounds/new')
}

module.exports.newPost = async (req, res, next) => {
  const geoData = await geocoder.forwardGeocode({
    query: req.body.campground.location,
    limit: 1
  }).send()
  console.log(geoData.body.features[0].geometry);
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  campground.images = req.files.map(f => ({ url: f.location, filename: f.originalname }))
  campground.author = req.user._id;
  //without save it works, but i can check if it worked
  await campground.save()
  console.log(campground)
  req.flash('success','Successfully made a new campground!')
  res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.getId = async (req, res) => {
  const camp = await Campground.findById(req.params.id).populate({
    path: 'reviews',
    populate: {
      path: 'author',
    }
  }).populate('author');
  if (!camp) {
    req.flash('error', 'CAnnot find that campground');
    return res.redirect('/campgrounds')
  }
  res.render('campgrounds/show', {camp})
}

module.exports.idEdit = async (req, res) => {
  const camp = await Campground.findById(req.params.id)

  if (!camp) {
    req.flash('error', 'CAnnot find that campground');
    return res.redirect('/campgrounds')
  }
  res.render('campgrounds/edit', {camp})
}

const s3 = new S3Client({
  region: 'eu-central-1',
  credentials: {
    accessKeyId: process.env.aws_access_key_id,
    secretAccessKey: process.env.aws_secret_access_key,
  }
})

// const bucketParams = {
//   Bucket: 'yelp-camp-bucket',
//   Key: filename
// }


// AWS!!!!!!!!!!!!!!!!!!
module.exports.putId = async (req, res) => {
  const camp = await Campground.findByIdAndUpdate(
    req.params.id, { ...req.body.campground });
  console.log(req.body)
  const imgs = req.files.map(f => ({ url: f.location, filename: f.originalname }))
  camp.images.push(...imgs);
  //without save it works, but i can check if it worked
  await camp.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      s3.send(new DeleteObjectCommand({
        Bucket: 'yelp-camp-bucket',
        Key: filename
      }))
    }
    await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })  
    console.log(camp)
  }
  req.flash('success',"Successfully updated!!")
  res.redirect(`/campgrounds/${camp._id}`)
}

module.exports.deleteId = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
  if (!campground.author.equals(req.user._id)) {
    req.flash('error', 'YOU DO NOT HAVE PERMISSIONS!')
    return res.redirect(`/campgrounds/${id}`);
  }
  await Campground.findByIdAndDelete(req.params.id)
  req.flash('success','Successfully deleted!')
  res.redirect('/campgrounds')
}