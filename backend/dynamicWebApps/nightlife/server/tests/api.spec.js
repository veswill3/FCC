// testing utilities
const proxyquire = require('proxyquire');
const chai = require('chai');
const chaiHttp = require('chai-http');
// stub yelp methods
const yelpStub = require('./yelp.stub');

const server = proxyquire('../server', { 'yelp-fusion': yelpStub });

const jwt = require('jsonwebtoken');
const User = require('mongoose').model('User');
const Event = require('mongoose').model('Event');

chai.use(chaiHttp);
const expect = chai.expect;

describe('/api', () => {
  let nickUser;
  let kateUser;
  let nickToken;
  before(() =>
    Promise.all([
      User.remove().exec(),
      Event.remove().exec(),
    ])
      .then(() =>
        User.create([
          { username: 'nightlife-nick', password: 'guest' },
          { username: 'fun-times-kate', password: 'guest' },
        ]),
      )
      .then(([nick, kate]) => {
        nickUser = nick;
        kateUser = kate;
        nickToken = jwt.sign({ sub: nick._id }, process.env.jwtSecret);
      }),
  );
  describe('GET /api/venues/:location', () => {
    describe('with an invalid location', () => {
      it('returns a 404 with an error', (done) => {
        chai.request(server)
          .get('/api/venues/no-data-loc')
          .end((err, res) => {
            expect(res).to.have.status(404);
            expect(res.body).to.equal('Nothing found for "no-data-loc". Try a different location');
            done();
          });
      });
    });
    // describe('with events in the past' () => {});
    describe('with a valid location', () => {
      before(() => Event.remove().exec() // clear all events
        .then(() => Event.create([
          {
            yelpBusinessId: 'the-village-underground-new-york',
            attendees: [nickUser._id.toString()],
          },
          {
            yelpBusinessId: 'raines-law-room-new-york',
            attendees: [nickUser._id.toString(), kateUser._id.toString()],
          },
        ])));
      it('returns an array of busniess info and how many are going', (done) => {
        chai.request(server)
          .get('/api/venues/NYC')
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(Array.isArray(res.body)).to.be.true;
            expect(res.body.length).to.equal(3);

            expect(res.body[0].id).to.equal('rooftop-93-new-york-5');
            expect(res.body[0].name).to.equal('Rooftop 93');
            expect(res.body[0].url).to.equal('https://www.yelp.com/biz/rooftop-93-new-york-5?adjust_creative=rLmjHupXGsDfDsD6ErwOVg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=rLmjHupXGsDfDsD6ErwOVg');
            expect(res.body[0].imageUrl).to.equal('https://s3-media2.fl.yelpcdn.com/bphoto/ePNrhrwDplKU8jqk35Y8Sg/o.jpg');
            expect(res.body[0].numGoing).to.equal(0); // no associated event
            expect(res.body[0].reviews.length).to.equal(3);
            expect(res.body[0].reviews[0].name).to.equal('Irene W.');
            expect(res.body[0].reviews[0].text).to.equal('Drinks: 4/5\nService: 5/5\nAmbience: 5/5\n\nI was looking for a nice bar/lounge in lower Manhattan for my friends for Happy Hour and I and I happened to stumble...');
            expect(res.body[0].reviews[1].name).to.equal('Christine W.');
            expect(res.body[0].reviews[1].text).to.equal('Beautiful view of the Lower East Side and the Empire State off in the distance! I came here for Happy Hour with a girl friend for drinks and the deals were...');
            expect(res.body[0].reviews[2].name).to.equal('Sandy E.');
            expect(res.body[0].reviews[2].text).to.equal('I felt safe walking here, passed up very enticing beer garden on the ground floor, and got to the rooftop bar to find it very small, crowded and loud. This...');

            expect(res.body[1].id).to.equal('the-village-underground-new-york');
            expect(res.body[1].name).to.equal('The Village Underground');
            expect(res.body[1].url).to.equal('https://www.yelp.com/biz/the-village-underground-new-york?adjust_creative=rLmjHupXGsDfDsD6ErwOVg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=rLmjHupXGsDfDsD6ErwOVg');
            expect(res.body[1].imageUrl).to.equal('https://s3-media3.fl.yelpcdn.com/bphoto/81l9KO_4N_ZA9f6eLsjnUw/o.jpg');
            expect(res.body[1].numGoing).to.equal(1);
            expect(res.body[1].reviews.length).to.equal(3);
            expect(res.body[1].reviews[0].name).to.equal('Sarama D.');
            expect(res.body[1].reviews[0].text).to.equal('The show was great. Me and the hubby went to see Hassan Minaj during our recent trip to NYC.  I actually really like the space at the village underground...');
            expect(res.body[1].reviews[1].name).to.equal('Tay J.');
            expect(res.body[1].reviews[1].text).to.equal('Went on a Friday night, and it was pretty crowded. The crowd is great. Bartenders are super friendly, servers were awesome! BEST PLACE TO GO!');
            expect(res.body[1].reviews[2].name).to.equal('Lorelei Y.');
            expect(res.body[1].reviews[2].text).to.equal('Like many other reviewers, I came here for a Comedy Cellar show. The show itself was actually quite good (with the exception of one comic whose humor veered...');

            expect(res.body[2].id).to.equal('raines-law-room-new-york');
            expect(res.body[2].name).to.equal('Raines Law Room');
            expect(res.body[2].url).to.equal('https://www.yelp.com/biz/raines-law-room-new-york?adjust_creative=rLmjHupXGsDfDsD6ErwOVg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=rLmjHupXGsDfDsD6ErwOVg');
            expect(res.body[2].imageUrl).to.equal('https://s3-media2.fl.yelpcdn.com/bphoto/DZlxemV4ZI_HNzi2uq10sg/o.jpg');
            expect(res.body[2].numGoing).to.equal(2);
            expect(res.body[2].reviews.length).to.equal(3);
            expect(res.body[2].reviews[0].name).to.equal('Tanya D.');
            expect(res.body[2].reviews[0].text).to.equal("So cool! We came here on a Monday night and it wasn't too busy. You ring the door bell to enter into the completely unsuspecting bar, and so right from the...");
            expect(res.body[2].reviews[1].name).to.equal('Alka M.');
            expect(res.body[2].reviews[1].text).to.equal("Easily one of my favorite bars in NYC. The ambiance, drinks, and service is just great. I've come here several times, both casually and once for a friend's...");
            expect(res.body[2].reviews[2].name).to.equal('Emily A.');
            expect(res.body[2].reviews[2].text).to.equal("one of new york's best kept secrets! it's tiny so be prepared to wait but the cocktail menu is extensive and this place has a neat vibe. i would also say...");
            done();
          });
      });
    });
    describe('when auth is provided', () => {
      before(() => Event.remove().exec() // clear all events
        .then(() => Event.create({
          yelpBusinessId: 'the-village-underground-new-york',
          attendees: [nickUser._id.toString(), kateUser._id.toString()],
        })));
      it('flags venues you are going to', (done) => {
        chai.request(server)
          .get('/api/venues/NYC')
          .set('Authorization', `bearer ${nickToken}`)
          .end((err, res) => {
            expect(res.body[0].amIgoing).to.be.false;
            expect(res.body[1].amIgoing).to.be.true;
            done();
          });
      });
    });
  });

  describe('POST /api/rsvp/:id', () => {
    describe('without authorization', () => {
      it('returns a 401 with an error', (done) => {
        chai.request(server)
          .post('/api/rsvp/does-not-matter')
          .end((err, res) => {
            expect(res).to.have.status(401);
            expect(res.body).to.equal('Not authorized');
            done();
          });
      });
    });
    describe('to a non-existent yelp id', () => {
      it('returns a 404 with an error', (done) => {
        chai.request(server)
          .post('/api/rsvp/not-an-id')
          .set('Authorization', `bearer ${nickToken}`)
          .end((err, res) => {
            expect(res).to.have.status(404);
            expect(res.body).to.equal('Could not RSVP: not-an-id not found');
            done();
          });
      });
    });
    describe('when you are the first going', () => {
      before(() => Event.remove().exec()); // clear all events
      it('creates event and with you as the only attendee', (done) => {
        chai.request(server)
          .post('/api/rsvp/some-working-id')
          .set('Authorization', `bearer ${nickToken}`)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.equal('RSVP updated');
            Event.find().exec()
              .then(([event]) => {
                expect(event.attendees.length).to.equal(1);
                expect(event.attendees[0]).to.equal(nickUser._id.toString());
                done();
              });
          });
      });
    });
    describe('when you jump on the bandwagon', () => {
      before(() => {
        Event.remove().exec()
          .then(Event.create({
            yelpBusinessId: 'some-working-id',
            attendees: [kateUser._id.toString()],
          }).exec);
      });
      it('adds you to the list of attendees', (done) => {
        chai.request(server)
          .post('/api/rsvp/some-working-id')
          .set('Authorization', `bearer ${nickToken}`)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.equal('RSVP updated');
            Event.find().exec()
              .then(([event]) => {
                expect(event.attendees.length).to.equal(2);
                expect(event.attendees.includes(nickUser._id.toString())).to.true;
                done();
              });
          });
      });
    });
    describe('when you already sent an RSVP', () => {
      before(() => {
        Event.remove().exec()
          .then(Event.create({
            yelpBusinessId: 'some-working-id',
            attendees: [nickUser._id.toString()],
          }).exec);
      });
      it('removes you (and only you) from the list of attendees', (done) => {
        chai.request(server)
          .post('/api/rsvp/some-working-id')
          .set('Authorization', `bearer ${nickToken}`)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.equal('RSVP updated');
            Event.find().exec()
              .then(([event]) => {
                expect(event.attendees.length).to.equal(0);
                done();
              });
          });
      });
    });
  });
});
