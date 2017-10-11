const express = require('express');
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const User = require('mongoose').model('User');


const registerStrategy = new Strategy({
  usernameField: 'username',
  passwordField: 'password',
  session: false,
  passReqToCallback: true,
}, (req, username, password, cb) => {
  const newUser = new User({ username, password });
  newUser.save((err) => {
    if (err) { return cb(err); }
    const token = jwt.sign({ sub: newUser._id }, process.env.jwtSecret);
    return cb(null, token, newUser);
  });
});

const loginStrategy = new Strategy({
  usernameField: 'username',
  passwordField: 'password',
  session: false,
  passReqToCallback: true,
}, (req, username, password, cb) => {
  const nameOrPassErr = () => new Error('Incorrect username or password');
  return User.findOne({ username }, (err, user) => {
    if (err) { return cb(err); }
    if (!user) { return cb(nameOrPassErr()); }
    // check if a hashed user's password is equal to a value saved in the database
    return user.comparePassword(password, (passwordErr, isMatch) => {
      if (passwordErr) { return cb(passwordErr); }
      if (!isMatch) { return cb(nameOrPassErr()); }
      // create a token string
      const token = jwt.sign({ sub: user._id }, process.env.jwtSecret);
      return cb(null, token, user);
    });
  });
});

passport.use('local-register', registerStrategy);
passport.use('local-login', loginStrategy);

const router = new express.Router();

/**
 * Register
 *
 * @ bodyparam {String} username - required
 * @ bodyparam {String} password - required
 * If missing username or password, returns a 400 bad request. otherwise it
 * returns 200 ok with a token and username
 */
router.post('/register', (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json('Missing username or password');
  }

  return passport.authenticate('local-register', (err, token, user) => {
    if (err) {
      return res.status(400).json('Unable to register');
    }

    return res.status(200).json({
      token,
      username: user.username,
    });
  })(req, res, next);
});

/**
 * Login
 *
 * @ bodyparam {String} username - required
 * @ bodyparam {String} password - required
 * If missing username or password, returns a 400 bad request. otherwise it
 * returns 200 ok with a token and username
 */
router.post('/login', (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json('Missing username or password');
  }

  return passport.authenticate('local-login', (err, token, user) => {
    if (err) {
      return res.status(400).json('Incorrect username or password');
    }

    return res.status(200).json({
      token,
      username: user.username,
    });
  })(req, res, next);
});

module.exports = router;
