/* eslint-env mocha */
/* eslint-disable no-unused-expressions */

// testing utilities
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');

const expect = chai.expect;

// data utilities
const jwt = require('jsonwebtoken');
const User = require('mongoose').model('User');
const Poll = require('mongoose').model('Poll');

chai.use(chaiHttp);

describe('/auth', () => {
  before((done) => {
    // clear out all users
    User.remove().exec()
      .then(() => {
        User.create({ username: 'Joe', password: 'guest' })
          .then(() => done());
      });
  });
  describe('POST /auth/register', () => {
    describe('without a username', () => {
      it('responds with status 400 bad request', (done) => {
        chai.request(server)
          .post('/auth/register')
          .send({ password: 'guest' })
          .end((err, res) => {
            expect(res).to.have.status(400);
            expect(res.body).to.equal('Missing username or password');
            done();
          });
      });
    });
    describe('without a password', () => {
      it('responds with status 400 bad request', (done) => {
        chai.request(server)
          .post('/auth/register')
          .send({ username: 'newuser' })
          .end((err, res) => {
            expect(res).to.have.status(400);
            expect(res.body).to.equal('Missing username or password');
            done();
          });
      });
    });
    describe('with an taken username', () => {
      it('responds with status 400 bad request', (done) => {
        chai.request(server)
          .post('/auth/register')
          .send({ username: 'Joe', password: '1234' })
          .end((err, res) => {
            expect(res).to.have.status(400);
            expect(res.body).to.equal('Unable to register');
            done();
          });
      });
    });
    describe('with a new username and password', () => {
      it('responds with status 200, a token, and username', (done) => {
        chai.request(server)
          .post('/auth/register')
          .send({ username: 'Charlie', password: 'unicorn' })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.username).to.equal('Charlie');
            expect(res.body.token).to.exist;
            done();
          });
      });
    });
  });
  describe('POST /auth/login', () => {
    describe('without a username', () => {
      it('responds with status 400 bad request', (done) => {
        chai.request(server)
          .post('/auth/login')
          .send({ password: 'guest' })
          .end((err, res) => {
            expect(res).to.have.status(400);
            expect(res.body).to.equal('Missing username or password');
            done();
          });
      });
    });
    describe('without a password', () => {
      it('responds with status 400 bad request', (done) => {
        chai.request(server)
          .post('/auth/login')
          .send({ username: 'newuser' })
          .end((err, res) => {
            expect(res).to.have.status(400);
            expect(res.body).to.equal('Missing username or password');
            done();
          });
      });
    });
    describe('with the wrong password', () => {
      it('responds with status 400 bad request', (done) => {
        chai.request(server)
          .post('/auth/login')
          .send({ username: 'Joe', password: 'wrong' })
          .end((err, res) => {
            expect(res).to.have.status(400);
            expect(res.body).to.equal('Incorrect username or password');
            done();
          });
      });
    });
    describe('with a username and correct password', () => {
      it('responds with status 200, a token, and username', (done) => {
        chai.request(server)
          .post('/auth/login')
          .send({ username: 'Joe', password: 'guest' })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.username).to.equal('Joe');
            expect(res.body.token).to.exist;
            done();
          });
      });
    });
  });
});

describe('/api', () => {
  let supermanUser;
  let supermanToken;
  let lexToken;
  before((done) => {
    // clear out database
    Promise.all([
      User.remove().exec(),
      Poll.remove().exec(),
    ])
      .then(() =>
      // create some users
        User.create([
          { username: 'Superman', password: 'krypton' },
          { username: 'Lex', password: 'Luthor' },
        ]),
      )
      .then((users) => {
        [supermanUser] = users;
        supermanToken = jwt.sign({ sub: users[0]._id }, process.env.jwtSecret);
        lexToken = jwt.sign({ sub: users[1]._id }, process.env.jwtSecret);
      })
      .then(() => done());
  });
  describe('GET /api/polls (List all polls)', () => {
    before((done) => {
      // delete all polls (if any)
      Poll.remove().exec()
        .then(() => done())
        .catch(e => console.log(e));
    });
    describe('with no existing polls', () => {
      it('returns an empty list', (done) => {
        chai.request(server)
          .get('/api/polls')
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(Array.isArray(res.body)).to.be.true;
            expect(res.body.length).to.equal(0);
            done();
          });
      });
    });
    describe('with existing polls', () => {
      before((done) => {
        Poll.create([
          {
            title: 'Favorite Color',
            options: { Red: true, Blue: true },
          },
          {
            title: 'Worst Movie',
            options: { 'suicide squad': true },
          },
        ])
          .then(() => done());
      });
      it('returns a list of all polls', (done) => {
        chai.request(server)
          .get('/api/polls')
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(Array.isArray(res.body)).to.be.true;
            expect(res.body.length).to.equal(2);
            expect(res.body[0].title).to.exist;
            expect(res.body[0].id).to.exist;
            done();
          });
      });
    });
    describe('with auth but no owned polls', () => {
      it('returns an empty list with 200 ok', (done) => {
        chai.request(server)
          .get('/api/polls')
          .set('Authorization', `bearer ${supermanToken}`)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(Array.isArray(res.body)).to.be.true;
            expect(res.body.length).to.equal(0);
            done();
          });
      });
    });
    describe('with auth and owned polls', () => {
      before((done) => {
        // create some polls for superman
        Poll.create([
          { title: 'poll1', options: { opt1: true, opt2: true }, owner: supermanUser },
          { title: 'poll2', options: { opt1: true, opt2: true }, owner: supermanUser },
          { title: 'poll3', options: { opt1: true, opt2: true }, owner: supermanUser },
        ])
          .then(() => done());
      });
      it('returns all of them as a list', (done) => {
        chai.request(server)
          .get('/api/polls')
          .set('Authorization', `bearer ${supermanToken}`)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(Array.isArray(res.body)).to.be.true;
            expect(res.body.length).to.equal(3);
            expect(res.body[0].title).to.exist;
            expect(res.body[0].id).to.exist;
            done();
          });
      });
    });
  });
  describe('POST /api/polls (Create a poll)', () => {
    describe('with invalid authorization', () => {
      it('returns 401 Unauthorized', (done) => {
        chai.request(server)
          .post('/api/polls')
          .set('Authorization', 'bearer invalidToken')
          .send({
            title: 'test title',
            options: ['red', 'green', 'blue'],
          })
          .end((err, res) => {
            expect(res).to.have.status(401);
            expect(res.body).to.equal('Not authorized');
            done();
          });
      });
    });
    describe('without passing a title', () => {
      it('returns a 422 Unprocessable Entity with error message', (done) => {
        chai.request(server)
          .post('/api/polls')
          .set('Authorization', `bearer ${supermanToken}`)
          .send({
            options: ['red', 'green', 'blue'],
          })
          .end((err, res) => {
            expect(res).to.have.status(422);
            expect(res.body).to.equal('Missing title or options');
            done();
          });
      });
    });
    describe('without passing options', () => {
      it('returns a 422 Unprocessable Entity with error message', (done) => {
        chai.request(server)
          .post('/api/polls')
          .set('Authorization', `bearer ${supermanToken}`)
          .send({
            title: 'Fastest flying object',
          })
          .end((err, res) => {
            expect(res).to.have.status(422);
            expect(res.body).to.equal('Missing title or options');
            done();
          });
      });
    });
    describe('with blank options', () => {
      it('returns a 422 Unprocessable Entity with error message', (done) => {
        chai.request(server)
          .post('/api/polls')
          .set('Authorization', `bearer ${supermanToken}`)
          .send({
            title: 'Fastest flying object',
            options: ['', '', null],
          })
          .end((err, res) => {
            expect(res).to.have.status(422);
            expect(res.body).to.equal('Must contain at least one option');
            done();
          });
      });
    });
    describe('with auth, title, and options', () => {
      it('returns a 200 ok with ID to new poll', (done) => {
        chai.request(server)
          .post('/api/polls')
          .set('Authorization', `bearer ${supermanToken}`)
          .send({
            title: 'Fastest Flying Object',
            options: ['bird', 'plane', 'superman'],
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.exist;
            // make sure the ID points to the new poll
            Poll.findById(res.body).exec()
              .then((poll) => {
                expect(poll.title).to.equal('Fastest Flying Object');
                done();
              });
          });
      });
    });
  });
  describe('GET /api/poll/:id (View a poll)', () => {
    describe('with an invalid id', () => {
      it('responds with 404 poll not found', (done) => {
        chai.request(server)
          .get('/api/poll/not-a-poll-id')
          .end((err, res) => {
            expect(res).to.have.status(404);
            expect(res.body).to.equal('Poll not-a-poll-id not found.');
            done();
          });
      });
    });
    describe('with a valid id', () => {
      let pollId;
      before((done) => {
        Poll.create({
          title: 'Favorite Fire Truck Color',
          options: { red: true },
          votes: { 'some-ip': 'red', 'some-other-ip': 'red' },
        })
          .then((poll) => {
            pollId = poll._id;
            done();
          });
      });
      it('responds with that poll', (done) => {
        chai.request(server)
          .get(`/api/poll/${pollId}`)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.title).to.equal('Favorite Fire Truck Color');
            expect(res.body.votes.red).to.equal(2);
            done();
          });
      });
    });
    describe('with auth as owner', () => {
      let pollId;
      before((done) => {
        Poll.create({
          title: 'Favorite Fire Truck Color',
          owner: supermanUser,
          options: { red: true },
          votes: { 'some-ip': 'red', 'some-other-ip': 'red' },
        })
          .then((poll) => {
            pollId = poll._id;
            done();
          });
      });
      it('includes an indication that I am the owner', (done) => {
        chai.request(server)
          .get(`/api/poll/${pollId}`)
          .set('Authorization', `bearer ${supermanToken}`)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.isMyPoll).to.be.true;
            done();
          });
      });
    });
  });
  describe('PATCH /api/poll/:id (Add an option to a poll)', () => {
    let bestFoodPoll;
    before((done) => {
      Poll.create({
        title: 'Best Food Ever',
        options: { pizza: true, tacos: true, 'ice cream': true },
        owner: supermanUser,
      })
        .then((poll) => {
          bestFoodPoll = poll;
          done();
        });
    });
    describe('with an invalid id', () => {
      it('responds with a 404', (done) => {
        chai.request(server)
          .patch('/api/poll/not-a-poll-id')
          .set('Authorization', `bearer ${supermanToken}`)
          .send({ newOption: 'cranberries' })
          .end((err, res) => {
            expect(res).to.have.status(404);
            expect(res.body).to.equal('Add option failed. Poll not-a-poll-id not found.');
            done();
          });
      });
    });
    describe('with invalid authorization', () => {
      it('responds with 401 not authorized', (done) => {
        chai.request(server)
          .patch(`/api/poll/${bestFoodPoll._id}`)
          .set('Authorization', 'bearer bad-token')
          .send({ newOption: 'cranberries' })
          .end((err, res) => {
            expect(res).to.have.status(401);
            expect(res.body).to.equal('Not authorized');
            done();
          });
      });
    });
    describe('without passing newOption', () => {
      it('responds with 422 Unprocessable Entity', (done) => {
        chai.request(server)
          .patch(`/api/poll/${bestFoodPoll._id}`)
          .set('Authorization', `bearer ${supermanToken}`)
          .send({ something_else: 'cranberries' })
          .end((err, res) => {
            expect(res).to.have.status(422);
            expect(res.body).to.equal('Missing newOption');
            done();
          });
      });
    });
    describe('with a newOption that already exists', () => {
      it('responds with 422 Unprocessable Entity', (done) => {
        chai.request(server)
          .patch(`/api/poll/${bestFoodPoll._id}`)
          .set('Authorization', `bearer ${supermanToken}`)
          .send({ newOption: 'tacos' })
          .end((err, res) => {
            expect(res).to.have.status(422);
            expect(res.body).to.equal('newOption must not already exist');
            done();
          });
      });
    });
    describe('with the correct id, auth, and newOption', () => {
      it('responds with the updated poll', (done) => {
        chai.request(server)
          .patch(`/api/poll/${bestFoodPoll._id}`)
          .set('Authorization', `bearer ${supermanToken}`)
          .send({ newOption: 'cranberries' })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.votes.cranberries).to.equal(0); // no votes yet
            // verify that it actually saved to the document
            Poll.findById(bestFoodPoll._id).exec()
              .then((p) => {
                expect(p.options.cranberries).to.be.true;
                done();
              });
          });
      });
    });
  });
  describe('DELETE /api/poll/:id (Delete a poll)', () => {
    let how2spellPoll;
    before((done) => {
      Poll.create({
        title: 'How to Spell the shade between black and white',
        votes: { grey: 0, gray: 0 },
        owner: supermanUser,
        user_votes: {},
        ip_votes: {},
      })
        .then((poll) => {
          how2spellPoll = poll;
          done();
        });
    });
    describe('with invalid id', () => {
      it('responds with 404 not found', (done) => {
        chai.request(server)
          .delete('/api/poll/not-a-poll-id')
          .set('Authorization', `bearer ${supermanToken}`)
          .end((err, res) => {
            expect(res).to.have.status(404);
            expect(res.body).to.equal('Delete failed. Poll not-a-poll-id not found.');
            done();
          });
      });
    });
    describe('with invalid authorization', () => {
      it('responds with 401 Unauthorized', (done) => {
        chai.request(server)
          .delete(`/api/poll/${how2spellPoll._id}`)
          .set('Authorization', 'bearer made-up-token')
          .end((err, res) => {
            expect(res).to.have.status(401);
            expect(res.body).to.equal('Not authorized');
            done();
          });
      });
    });
    describe('with the wrong auth (not owning user)', () => {
      it('responds with 401 Unauthorized and message about ownership', (done) => {
        chai.request(server)
          .delete(`/api/poll/${how2spellPoll._id}`)
          .set('Authorization', `bearer ${lexToken}`) // not owner's token
          .end((err, res) => {
            expect(res).to.have.status(401);
            expect(res.body).to.equal('You can only delete a poll you own');
            done();
          });
      });
    });
    describe('with the correct authorization', () => {
      let wrostPrezPollID;
      before((done) => {
        Poll.create({
          title: 'Who is the worst Leader',
          votes: { trump: 0, stalin: 0 },
          owner: supermanUser,
          user_votes: {},
          ip_votes: {},
        })
          .then((poll) => {
            wrostPrezPollID = poll._id;
            done();
          });
      });
      it('removes the poll', (done) => {
        chai.request(server)
          .delete(`/api/poll/${wrostPrezPollID}`)
          .set('Authorization', `bearer ${supermanToken}`) // not owner's token
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.deleted).to.equal(wrostPrezPollID.toString());
            Poll.findById(wrostPrezPollID).exec()
              .then((poll) => {
                expect(poll).to.not.exist;
                done();
              });
          });
      });
    });
  });
  describe('POST /api/vote/:id (Vote on a poll)', () => {
    let testPoll;
    // make a helper to quickly setup who is voting for what
    const voteHelper = (ip, option) => new Promise((resolve) => {
      chai.request(server)
        .post(`/api/vote/${testPoll._id}`)
        .set('x-forwarded-for', ip)
        .send({ vote: option })
        .end((err, res) => resolve(res));
    });
    beforeEach((done) => {
      Poll.create({
        title: 'poll title',
        options: { opt1: true, opt2: true, opt3: true },
      })
        .then((poll) => {
          testPoll = poll;
          done();
        });
    });
    describe('with invalid id', () => {
      it('responds with 404 not found', (done) => {
        chai.request(server)
          .post('/api/vote/not-a-poll-id')
          .send({ vote: 'thanksgiving' })
          .end((err, res) => {
            expect(res).to.have.status(404);
            expect(res.body).to.equal('Vote failed. Poll not-a-poll-id not found.');
            done();
          });
      });
    });
    describe('without a vote', () => {
      it('responds with 422 Unprocessable Entity', (done) => {
        chai.request(server)
          .post(`/api/vote/${testPoll._id}`)
          .send({ 'price of tea': 'in china' })
          .end((err, res) => {
            expect(res).to.have.status(422);
            expect(res.body).to.equal('You must specify which option to vote for');
            done();
          });
      });
    });
    describe('for an option that does not exist', () => {
      it('responds with 422 Unprocessable Entity', (done) => {
        voteHelper('192.168.1.123', 'raspberries').then((res) => {
          expect(res).to.have.status(422);
          expect(res.body).to.equal('raspberries is not a valid option for this poll');
          done();
        });
      });
    });
    describe('with a vote', () => {
      it('counts to the provided option', (done) => {
        voteHelper('192.168.1.123', 'opt2').then((res) => {
          expect(res).to.have.status(200);
          // make sure we incimented our vote and not others
          expect(res.body.votes.opt1).to.equal(0);
          expect(res.body.votes.opt2).to.equal(1);
          expect(res.body.votes.opt3).to.equal(0);
          done();
        }).catch(e => console.log(e));
      });
    });
    describe('after already voting for the same thing', () => {
      it('does not double count', (done) => {
        Promise.all([
          voteHelper('ip', 'opt2'),
          voteHelper('ip', 'opt2'),
        ])
          .then(() => {
            chai.request(server)
              .get(`/api/poll/${testPoll._id}`)
              .end((err, res) => {
                expect(res.body.votes.opt2).to.equal(1);
                done();
              });
          }).catch(e => console.log(e));
      });
    });
    describe('after already voting for something else', () => {
      it('changes the vote instead of voting again', (done) => {
        voteHelper('192.168.1.123', 'opt2').then((res) => {
          expect(res).to.have.status(200);
          // make sure we incimented our vote and not others
          expect(res.body.votes.opt1).to.equal(0);
          expect(res.body.votes.opt2).to.equal(1);
          expect(res.body.votes.opt3).to.equal(0);
        })
          .then(() => {
            voteHelper('192.168.1.123', 'opt1').then((res) => {
              expect(res).to.have.status(200);
              // make sure it swaped the vote and does not double count
              expect(res.body.votes.opt1).to.equal(1);
              expect(res.body.votes.opt2).to.equal(0);
              expect(res.body.votes.opt3).to.equal(0);
              done();
            });
          }).catch(e => console.log(e));
      });
    });
    describe('with multiple voters', () => {
      it('tallies as expected', (done) => {
        Promise.all([
          voteHelper('ip-1', 'opt2'),
          voteHelper('ip-2', 'opt2'),
          voteHelper('ip-3', 'opt3'),
          voteHelper('ip-4', 'opt3'),
          voteHelper('ip-5', 'opt1'),
          voteHelper('ip-6', 'opt3'),
        ])
          .then(() => {
            chai.request(server)
              .get(`/api/poll/${testPoll._id}`)
              .end((err, res) => {
                expect(res.body.votes.opt1).to.equal(1);
                expect(res.body.votes.opt2).to.equal(2);
                expect(res.body.votes.opt3).to.equal(3);
                done();
              });
          });
      });
    });
  });
});
