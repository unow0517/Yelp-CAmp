const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  body: String,
  rating: Number,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
})

// make model, make a collection in database
module.exports = mongoose.model('Review', reviewSchema);
