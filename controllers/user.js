const { model } = require("mongoose");
const User = require('../models/user')

module.exports.userRegister = (req, res) => {
  res.render('users/register')
}

module.exports.postRegister = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => {
      if (err) return next(err);
      req.flash('SUCCESS','Welcome to Yelp Camp!');
      res.redirect('/campgrounds');
    })

  } catch (e) {
    req.flash('error', e.message);
    res.redirect('register')
  }
}

module.exports.logIn = (req, res) => {
  res.render('users/login')
}

module.exports.postLogIn = (req, res) => {
  req.flash('success', 'you are looged in');
  // if req.session.returnTo exist => it is it , or /campgrounds
  const redirectUrl = req.session.returnTo || '/campgrounds';
  delete req.session.returnTo;
  res.redirect(redirectUrl);
}

module.exports.getLogOut = (req, res) => {
  req.logout(function (err) {
    if (err) { return next(err) }
  })
  req.flash('success', 'Goodbye');
  res.redirect('/campgrounds');
}

