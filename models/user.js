const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  }
});

// it add username, hash and salt field to store UN,
// hashed pw and the salt. and some Methods
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',UserSchema)