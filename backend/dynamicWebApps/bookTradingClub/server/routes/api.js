const express = require('express');

const router = new express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const rp = require('request-promise-native');

const User = mongoose.model('User');
const Trade = mongoose.model('Trade');

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
      req.authInfo = { token, user }; // add authorization info to the request
    }
  } catch (error) { /* dont care */ }
  return next();
});

router.get('/settings', (req, res) => {
  if (!req.authInfo || !req.authInfo.user) {
    return res.status(401).json('Not authorized');
  }
  const { user } = req.authInfo;
  return res.json({
    name: user.name,
    zipcode: user.zipcode,
    city: user.city,
    state: user.state,
  });
});

router.post('/settings', async (req, res) => {
  if (!req.authInfo || !req.authInfo.user) {
    return res.status(401).json('Not authorized');
  }
  if (req.body.city || req.body.state) {
    return res.status(400).json('Location can only be modified by zipcode');
  }
  const { user } = req.authInfo;
  if (req.body.name) user.name = req.body.name;
  if (req.body.zipcode) {
    user.zipcode = req.body.zipcode;
    // Lookup city and state via API
    let locData;
    try {
      locData = await rp.get(`http://api.zippopotam.us/us/${req.body.zipcode}`);
    } catch (e) {
      return res.status(400).json('zipcode must be a valid US zipcode');
    }
    const locParsed = JSON.parse(locData);
    user.city = locParsed.places[0]['place name'];
    user.state = locParsed.places[0].state;
  }
  const updatedUser = await user.save();
  return res.json({
    name: updatedUser.name,
    zipcode: updatedUser.zipcode,
    city: updatedUser.city,
    state: updatedUser.state,
  });
});

router.get('/library', (req, res) => {
  if (!req.authInfo || !req.authInfo.user) {
    return res.status(401).json('Not authorized');
  }
  return res.json(req.authInfo.user.library);
});

router.post('/library/:id', async (req, res) => {
  if (!req.authInfo || !req.authInfo.user) {
    return res.status(401).json('Not authorized');
  }
  const { user } = req.authInfo;
  if (user.library.includes(req.params.id)) {
    return res.status(400).json('Volume already in library');
  }
  user.library.push(req.params.id);
  const updatedUser = await user.save();
  return res.json(updatedUser.library);
});

router.delete('/library/:id', async (req, res) => {
  if (!req.authInfo || !req.authInfo.user) {
    return res.status(401).json('Not authorized');
  }
  const { user } = req.authInfo;
  const index = user.library.indexOf(req.params.id);
  if (index < 0) {
    return res.status(400).json('Volume ID not found in library');
  }
  user.library.splice(index, 1);
  const updatedUser = await user.save();
  return res.json(updatedUser.library);
});

router.get('/books', async (req, res) => {
  // no auth: get all books. with auth: all books but mine
  const users = await (req.authInfo ?
    User.where('_id').nin([req.authInfo.user._id]).exec() :
    User.find().exec());
  return res.json(users.map(user => ({
    user: user.username,
    name: user.name,
    city: user.city,
    state: user.state,
    library: user.library,
  })));
});

router.get('/trades', async (req, res) => {
  if (!req.authInfo || !req.authInfo.user) {
    return res.status(401).json('Not authorized');
  }
  const { user } = req.authInfo;
  const [inTrades, outTrades] = await Promise.all([
    // only retrive certain fields
    Trade.find({ owner: user }, '_id requestedBy book').populate('requestedBy', 'name username').exec(),
    Trade.find({ requestedBy: user }, '_id owner book').populate('owner', 'name username').exec(),
  ]);
  return res.json({
    incomming: inTrades.map(t =>
      ({
        id: t._id,
        requestedBy: t.requestedBy.name ? t.requestedBy.name : t.requestedBy.username,
        book: t.book,
      })),
    outgoing: outTrades.map(t =>
      ({
        id: t._id,
        owner: t.owner.name ? t.owner.name : t.owner.username,
        book: t.book,
      })),
  });
});

router.post('/trade', async (req, res) => {
  if (!req.authInfo || !req.authInfo.user) {
    return res.status(401).json('Not authorized');
  }
  const { user: who, book } = req.body;
  if (!who || !book) {
    return res.status(400).json('user and book are required');
  }
  const owner = await User.findOne({ username: who }).exec();
  if (!owner) {
    return res.status(404).json(`${who} not found`);
  }
  if (!owner.library.includes(book)) {
    return res.status(404).json(`${who} does not have volume with id ${book}`);
  }
  const trade = await Trade.create({
    requestedBy: req.authInfo.user,
    owner,
    book,
  });
  return res.json({
    id: trade._id,
    requestedBy: trade.requestedBy.username,
    owner: trade.owner.username,
    book: trade.book,
  });
});

router.delete('/trade/:id', async (req, res) => {
  if (!req.authInfo || !req.authInfo.user) {
    return res.status(401).json('Not authorized');
  }
  const { id } = req.params;
  const { user } = req.authInfo;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json(`Trade ${id} not found`);
  }
  const trade = await Trade.findById(id);
  if (!trade) {
    return res.status(404).json(`Trade ${id} not found`);
  }
  if (!trade.requestedBy.equals(user._id)) {
    return res.status(401).json('Not authorized');
  }
  await trade.remove();
  return res.json({ deleted: true });
});

// do the same checks for approve and reject
router.put('/trade/:id/*', async (req, res, next) => {
  if (!req.authInfo || !req.authInfo.user) {
    return res.status(401).json('Not authorized');
  }
  const { id } = req.params;
  const { user } = req.authInfo;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json(`Trade ${id} not found`);
  }
  const trade = await Trade.findById(id).populate('owner requestedBy');
  if (!trade) {
    return res.status(404).json(`Trade ${id} not found`);
  }
  if (!trade.owner.equals(user)) {
    return res.status(401).json('Not authorized');
  }
  // add the trade to the request
  req.trade = trade;
  return next();
});

router.put('/trade/:id/reject', async (req, res) => {
  // In a real app, this would notify the requesting user
  await req.trade.remove();
  return res.json({ rejected: true });
});

router.put('/trade/:id/approve', async (req, res) => {
  // in a real app there would be some sort of meetup workflow to coordinate the trade
  const { owner, requestedBy, book } = req.trade;
  // remove the book from the previous owner
  owner.library.splice(owner.library.indexOf(book), 1);
  // add the book to the requestors library
  requestedBy.library.push(book);
  // delete the trade
  await Promise.all([req.trade.remove(), owner.save(), requestedBy.save()]);
  return res.json({ approved: true });
});

module.exports = router;
