const express =require('express')
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync')
const user = require('../controllers/user')

router.route('/register')
  .get(user.userRegister)
  .post(catchAsync(user.postRegister))

router.route('/login')
  .get(user.logIn)
  .post(
    passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), user.postLogIn
  )

router.get('/logout', user.getLogOut );

module.exports = router;