const express = require('express');

const router = new express.Router();
const jwt = require('jsonwebtoken');
const User = require('mongoose').model('User');
const Event = require('mongoose').model('Event');

module.exports = (yelp) => {
  let yelpClient;
  yelp.accessToken(process.env.yelp_clientId, process.env.yelp_clientSecret)
    .then((response) => {
      console.log('Yelp access token acquired');
      yelpClient = yelp.client(response.jsonBody.access_token);
    })
    .catch((error) => {
      console.log('Error retrieving Yelp access token.', error);
      throw error;
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
        req.authInfo = { token, user }; // add authorization info to the request
      }
    } catch (error) { /* dont care */ }
    return next();
  });

  /**
   * Find venues by location. This will include how many plan to go tonight.
   * If you include authorization, it will flag which you are planning to go to.
   */
  router.get('/venues/:location', async (req, res) => {
    try {
      const yesterday = new Date(Date.now() - 86400000);
      const [yelpResponse] = await Promise.all([
        // search by location with category of nightlife
        yelpClient.search({
          location: req.params.location,
          categories: 'nightlife',
          // limit: 10,
        })
          .catch(() => { throw new Error('yelp-not-found-error'); }),
        // at the same time, clean up events from yesterday and previous
        Event.remove({ date: { $lt: yesterday } }).exec(),
      ]);
      const businesses = yelpResponse.jsonBody.businesses;
      if (!businesses) {
        throw new Error('yelp-not-found-error');
      }
      const businessIds = businesses.map(b => b.id);

      // get reviews for each busniess
      const reviewSearchPromises = businessIds.map(id =>
        yelpClient.reviews(id)
          .then(r => r.jsonBody.reviews)
          .catch(() => []), // swallow errors and return empty array
      );

      // create a promise to find events from DB
      const findMatchingEventsPromise = new Promise(async (resolve) => {
        // find all matching Events (if any)
        const eventSearchArray = await Event.find({
          yelpBusinessId: businessIds,
        }).exec();
        // store in object map by yelp id for easy access
        const eventsObj = eventSearchArray.reduce((acc, event) => {
          acc[event.yelpBusinessId] = event;
          return acc;
        }, {});
        return resolve(eventsObj);
      });

      // wait for event search in DB and review search at yelp
      const [eventsObj, ...reviews] = await Promise.all([
        findMatchingEventsPromise,
        ...reviewSearchPromises,
      ]);

      // map to an object to send to the client
      const outputData = businesses.map((business, index) => {
        const obj = {
          id: business.id,
          name: business.name,
          url: business.url,
          imageUrl: business.image_url,
          numGoing: 0, // for now
          amIgoing: false, // for now
          reviews: [],
        };
        // add reviews
        reviews[index].forEach((review) => {
          obj.reviews.push({
            name: review.user.name,
            text: review.text,
          });
        });
        // do we already have an event for this busniess?
        if (eventsObj[business.id]) {
          const event = eventsObj[business.id];
          obj.numGoing = event.attendees.length;
          // am I already signed up?
          if (req.authInfo && req.authInfo.user) {
            obj.amIgoing = event.attendees.includes(req.authInfo.user._id.toString());
          }
        }
        return obj;
      });

      // send data to the client
      return res.json(outputData);
    } catch (error) {
      if (error.message === 'yelp-not-found-error') {
        return res.status(404)
          .json(`Nothing found for "${req.params.location}". Try a different location`);
      }
      console.log('Error in GET /venues/:location', error);
      return res.status(500).json('Error getting venues');
    }
  });

  /**
   * RSVP to a venue for tonight. Authorization is required.
   */
  router.post('/rsvp/:id', async (req, res) => {
    if (!req.authInfo || !req.authInfo.user) {
      return res.status(401).json('Not authorized');
    }
    const userId = req.authInfo.user._id.toString();
    const yelpId = req.params.id;

    try {
      const event = await Event.findOne({ yelpBusinessId: yelpId }).exec();
      if (event) {
        // is this user already going?
        if (event.attendees.includes(userId)) {
          // remove this user
          event.attendees.splice(event.attendees.indexOf(userId), 1);
        } else {
          // add this user
          event.attendees.push(userId);
        }
        await event.save();
      } else {
        // no event yet: make sure the busniess exists at yelp, then create one
        try {
          await yelpClient.business(yelpId);
        } catch (e) {
          // no business found catches here
          return res.status(404).json(`Could not RSVP: ${yelpId} not found`);
        }
        await Event.create({ yelpBusinessId: yelpId, attendees: [userId] });
      }
      return res.json('RSVP updated');
    } catch (err) {
      console.log('Error in POST /rsvp/:id', err);
      return res.status(500).json('Error trying to RSVP');
    }
  });

  return router;
};
