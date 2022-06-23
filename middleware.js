const { campgroundSchema, reviewSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
  // req.user from passport = contains current user infos in session
  if (!req.isAuthenticated()) {
    // store the url they are requesting!
    req.session.returnTo = req.originalUrl
    req.flash('error', 'you must be signed in first')
    return res.redirect('/login');
  }
  next();
}

module.exports.validateCampground = (req, res, next) => {
  const {error} = campgroundSchema.validate(req.body)
  if (error) {
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(msg, 400)
  } else {
    next();
  }
}

module.exports.isAuthor = async (req, res, next) => {
  const campground = await Campground.findById(req.params.id)
  if (!campground.author.equals(req.user._id)) {
    req.flash('error', 'YOU DO NOT HAVE PERMISSIONS!')
    return res.redirect(`/campgrounds/${req.user._id}`);
  }
  next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
  const review = await Review.findById(req.params.reviewId)
  if (!review.author.equals(req.user._id)) {
    req.flash('error', 'YOU DO NOT HAVE PERMISSIONS!')
    return res.redirect(`/campgrounds/${req.user._id}`);
  }
  next();
}

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',')
    throw new ExpressError(msg, 400)
  } else {
    console.log('No Error!!')
    next();
  }
}