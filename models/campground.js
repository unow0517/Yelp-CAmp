const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String
})

ImageSchema.virtual('thumbnail').get(function () {
  return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const campGroundSchema = new Schema({
  title: String,
  images: [ImageSchema],
  geometry: {
    type: {
      type: String,
      enum: ['Point'], // 'location.type' must be 'Point'
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  price: Number,
  description: String,
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'Review'
  }],
}, opts);

campGroundSchema.virtual('properties.popUpMarkUp').get(function () {
  return `<strong>
  <a href="/campgrounds/${this._id}">${this.title}</a>
  <strong>
  <p>${this.description.substring(0,20)}...</p>

  `
})
//add post middleware, hooked method = findOneAndDelete, console.log is executed after findByIdAndUpdate
// findOneAndDelete = Query middleware, findByIdAndUpdate = API
campGroundSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews
      }
    })
  }
})

// Type of Middleware = Model middleware vs Query middleware
module.exports = mongoose.model('Campground', campGroundSchema)