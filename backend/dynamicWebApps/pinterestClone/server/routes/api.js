const express = require('express');

const router = new express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = mongoose.model('User');
const Pin = mongoose.model('Pin');

const pin2out = pin => ({
  id: pin._id,
  user: pin.user.username,
  url: pin.url,
  description: pin.description,
  likes: pin.likes.map(user => user.username),
  createdAt: pin.createdAt,
});

/**
 * Add user and token to the request if authorization info is provided
 */
router.use('/', async (req, res, next) => {
  if (!req.headers.authorization) {
    return next();
  }
  // get the last part from the authorization header like "bearer token"
  const token = req.headers.authorization.split(' ')[1];
  try {
    // decode the token using a secret key-phrase (from the 'sub' key)
    const { sub: userId } = jwt.verify(token, process.env.jwtSecret);
    const user = await User.findById(userId).exec();
    if (user) {
      req.authUser = user; // add the user to the request for easy access
    }
  } catch (error) { /* dont care */ }
  return next();
});

// create a new pin
router.post('/pins', async (req, res) => {
  if (!req.authUser) return res.status(401).json('Not authorized');
  if (!req.body.url) return res.status(400).json('url is required');
  try {
    const pin = await Pin.create({ ...req.body, user: req.authUser });
    return res.json(pin2out(pin));
  } catch (error) {
    return res.status(500).json('Could not create pin. Make sure your provide a valid URL.');
  }
});

// view all pins
router.get('/pins', async (req, res) => {
  const pins = await Pin.find()
    .populate('user likes')
    .sort({ createdAt: -1 })
    .exec();
  return res.json(pins.map(pin2out));
});

// handle errors for missing pins
router.use('/pin/:id', async (req, res, next) => {
  try {
    const pin = await Pin.findById(req.params.id)
      .populate('user likes')
      .exec();
    if (pin) {
      req.pin = pin; // easy access for next method
      return next();
    }
  } catch (e) { /* continue to the 404 */ }
  return res.status(404).json(`Pin with id ${req.params.id} not found`);
});

// view a specific pin (not needed really)
router.get('/pin/:id', async (req, res) => res.json(pin2out(req.pin)));

// like/unlike a pin
router.patch('/pin/:id', async (req, res) => {
  if (!req.authUser) return res.status(401).json('Not authorized');
  const isLiked = req.pin.likes.some(user => req.authUser.equals(user));
  if (isLiked) req.pin.likes.pull(req.authUser);
  else req.pin.likes.push(req.authUser);
  const updatedPin = await req.pin.save();
  return res.json(pin2out(updatedPin));
});

// delete a pin
router.delete('/pin/:id', async (req, res) => {
  if (!req.authUser || req.authUser.username !== req.pin.user.username) {
    return res.status(401).json('Not authorized');
  }
  await req.pin.remove();
  return res.json(pin2out(req.pin));
});

// view pins for user
router.get('/board/:user', async (req, res) => {
  const user = await User.findOne({ username: req.params.user }).exec();
  if (!user) return res.status(404).json(`User ${req.params.user} not found`);
  const pins = await Pin.find({ user })
    .populate('user likes')
    .sort({ createdAt: -1 })
    .exec();
  return res.json(pins.map(pin2out));
});

module.exports = router;
