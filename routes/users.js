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
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err); // will generate a 500 error
      }
      // Generate a JSON response reflecting authentication status
      if (!user) {
        return res.status(401).send({ error: 'Authentication failed' });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.status(202).send({ error: 'Authentication succeeded' });    
      });
    })
  )

router.get('/logout', user.getLogOut );

module.exports = router;