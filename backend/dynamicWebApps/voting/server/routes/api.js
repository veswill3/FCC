const express = require('express');

const router = new express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = mongoose.model('User');
const Poll = mongoose.model('Poll');

/**
 * convert a poll from DB to object to send to client (with totals)
 */
const poll2out = (poll, authInfo) => {
  // gather all options
  const votes = Object.keys(poll.options).reduce((acc, opt) => {
    acc[opt] = 0; // start at zero
    return acc;
  }, {});
  // add up all the votes
  Object.keys(poll.votes)
    .map((k => poll.votes[k]))
    .forEach((opt) => { votes[opt] += 1; });

  const outObj = { id: poll._id, title: poll.title, votes };
  // add ownership flag
  if (authInfo && authInfo.user &&
      poll.owner.toString() === authInfo.user._id.toString()) {
    outObj.isMyPoll = true;
  }
  return outObj;
};

/**
 * Add user and token to the request if authorization info is provided
 */
router.use('/', (req, res, next) => {
  if (!req.headers.authorization) {
    return next();
  }

  // get the last part from the authorization header string like "bearer token-value"
  const token = req.headers.authorization.split(' ')[1];
  // decode the token using a secret key-phrase
  return jwt.verify(token, process.env.jwtSecret, (errJwt, decoded) => {
    if (errJwt) {
      return next();
    }

    const userId = decoded.sub;
    return User.findById(userId, (errFind, user) => {
      if (errFind || !user) {
        return next();
      }

      // add authorization info to the request for easy access
      req.authInfo = { token, user };
      return next();
    });
  });
});

/**
 * Get all polls. If a token is provided, get all polls for that user
 */
router.get('/polls', (req, res) => {
  const q = req.authInfo ? { owner: req.authInfo.user } : {};
  Poll.find(q).exec()
    .then((polls) => {
    // strip to just title and id
      const pollList = polls.map(poll => ({ title: poll.title, id: poll._id }));
      res.json(pollList);
    })
    .catch((err) => {
      console.error('Error in GET /polls', err);
      return res.status(500).json('Oh no! Something went wrong.');
    });
});

/**
 * create a new poll - requires a token, title, and [options]
 * returns the new poll's ID
 */
router.post('/polls', (req, res) => {
  if (!req.authInfo || !req.authInfo.user) {
    return res.status(401).json('Not authorized');
  }

  const { title, options } = req.body;
  if (!title || !options) {
    return res.status(422).json('Missing title or options');
  }

  // strip invalid options
  let hasAtLeastOneOption = false;
  const reducedOptions = options.reduce((acc, opt) => {
    const o = (opt && opt.trim) ? opt.trim() : '';
    // remove blank options
    if (o !== '') {
      hasAtLeastOneOption = true;
      acc[o] = true;
    }
    return acc;
  }, {});

  if (!hasAtLeastOneOption) {
    return res.status(422).json('Must contain at least one option');
  }

  const newPoll = new Poll({
    title: title.trim(),
    owner: req.authInfo.user,
    options: reducedOptions,
  });
  return newPoll.save()
    .then(() => res.send(newPoll._id))
    .catch((err) => {
      console.log('Error in POST /polls', err);
      return res.status(500).json('Error saving poll');
    });
});

/**
 * View results of a poll
 * returns { title, votes: { opt1: 1, opt2: 3, ... } }
 */
router.get('/poll/:id', (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json(`Poll ${id} not found.`);
  }
  return Poll.findById(id).exec()
    .then((poll) => {
      if (!poll) {
        return res.status(404).json(`Poll ${id} not found.`);
      }
      return res.json(poll2out(poll, req.authInfo));
    })
    .catch((err) => {
      console.error('Error in GET /poll/:id', err);
      return res.status(500).json(`Error retrieving poll ${id}`);
    });
});

/**
 * Add an option to a poll - requires a token and new_option
 * returns { title, votes: { opt1: 1, opt2: 3, ... } }
 */
router.patch('/poll/:id', (req, res) => {
  // dont care who, but you must have an account to add an option
  if (!req.authInfo || !req.authInfo.user) {
    return res.status(401).json('Not authorized');
  }

  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json(`Add option failed. Poll ${id} not found.`);
  }

  const newOption = req.body.newOption && req.body.newOption.trim && req.body.newOption.trim();
  if (!newOption) {
    return res.status(422).json('Missing newOption');
  }

  return Poll.findById(id).exec()
    .then((poll) => {
      if (!poll) {
        return res.status(404).json(`Add option failed. Poll ${id} not found.`);
      }

      if (newOption in poll.options) {
        return res.status(422).json('newOption must not already exist');
      }

      const updates = { $set: {} };
      updates.$set[`options.${newOption}`] = true;
      return poll.update(updates, { w: 1 })
        .then(() => Poll.findById(id).exec()) // get the newly updated poll
        .then(updatedPoll => res.json(poll2out(updatedPoll, req.authInfo)));
    })
    .catch((err) => {
      console.error('Error in PATCH /poll/:id', err);
      return res.status(500).json(`Error adding ${newOption} to poll ${id}`);
    });
});

/**
 * Delete a poll - requires a token representing the owner
 * returns { deleted: id }
 */
router.delete('/poll/:id', (req, res) => {
  if (!req.authInfo || !req.authInfo.user) {
    return res.status(401).json('Not authorized');
  }

  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json(`Delete failed. Poll ${id} not found.`);
  }

  return Poll.findById(id).exec()
    .then((poll) => {
      if (!poll) {
        return res.status(404).json(`Delete failed. Poll ${id} not found.`);
      }

      if (poll.owner.toString() !== req.authInfo.user._id.toString()) {
        return res.status(401).json('You can only delete a poll you own');
      }

      return poll.remove()
        .then(deletedPoll => res.json({ deleted: deletedPoll._id }));
    })
    .catch((err) => {
      console.error('Error in DELETE /poll/:id', err);
      return res.status(500).json('Error deleting poll');
    });
});

/**
 * Vote on a poll - requires a vote
 * returns { title, votes: { opt1: 1, opt2: 3, ... } }
 */
router.post('/vote/:id', (req, res) => {
  const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress)
    .replace(/\./g, '_'); // swap . to _ to apease mongoose
  // const ip = Math.floor(Math.random() * Math.floor(10000)); // for testing
  const { vote } = req.body;

  if (!vote) {
    return res.status(422).json('You must specify which option to vote for');
  }

  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json(`Vote failed. Poll ${id} not found.`);
  }

  return Poll.findById(id).exec()
    .then((poll) => {
      if (!poll) {
        return res.status(404).json(`Vote failed. Poll ${id} not found.`);
      }

      if (!Object.prototype.hasOwnProperty.call(poll.options, vote)) {
        return res.status(422).json(`${vote} is not a valid option for this poll`);
      }

      const updates = { $set: {} };
      updates.$set[`votes.${ip}`] = vote; // log IP to prevent duplicate votes
      return poll.update(updates, { w: 1 })
        .then(() => Poll.findById(id).exec()) // get the newly updated poll
        .then(updatedPoll => res.json(poll2out(updatedPoll, req.authInfo)));
    })
    .catch((err) => {
      console.error('Error in POST /vote/:id', err);
      return res.status(500).json('Error trying to vote');
    });
});

module.exports = router;
