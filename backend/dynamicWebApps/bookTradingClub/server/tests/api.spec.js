const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../server');
const jwt = require('jsonwebtoken');
const User = require('mongoose').model('User');
const Trade = require('mongoose').model('Trade');

chai.use(chaiHttp);
const { expect } = chai;

describe('/api', () => {
  let user;
  let token;
  before(async () => {
    await Promise.all([
      User.remove().exec(), // remove all users
      Trade.remove().exec(),
    ]);
    user = await User.create({
      username: 'Bob',
      password: 'guest',
      library: ['a', 'b', 'c'],
      name: 'Robert',
      zipcode: 34238,
      city: 'Sarasota',
      state: 'Florida',
    });
    token = jwt.sign({ sub: user._id }, process.env.jwtSecret);
  });
  describe('GET /api/settings', () => {
    it('requires authorization', (done) => {
      chai.request(server)
        .get('/api/settings')
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.equal('Not authorized');
          done();
        });
    });
    it('responds with the current info', (done) => {
      chai.request(server)
        .get('/api/settings')
        .set('Authorization', `bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.name).to.equal('Robert');
          expect(res.body.zipcode).to.equal(34238);
          expect(res.body.city).to.equal('Sarasota');
          expect(res.body.state).to.equal('Florida');
          done();
        });
    });
  });
  describe('POST /api/settings', () => {
    beforeEach(async () => {
      user.name = 'Robert';
      user.zipcode = 34238;
      user.city = 'Sarasota';
      user.state = 'Florida';
      await user.save();
    });
    it('requires authorization', (done) => {
      chai.request(server)
        .post('/api/settings')
        .send({ name: 'Rob' })
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.equal('Not authorized');
          done();
        });
    });
    it('complains about passing a city', (done) => {
      chai.request(server)
        .post('/api/settings')
        .set('Authorization', `bearer ${token}`)
        .send({ city: 'New York' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.equal('Location can only be modified by zipcode');
          done();
        });
    });
    it('complains about passing a state', (done) => {
      chai.request(server)
        .post('/api/settings')
        .set('Authorization', `bearer ${token}`)
        .send({ state: 'New York' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.equal('Location can only be modified by zipcode');
          done();
        });
    });
    it('complains about invalid zipcodes', (done) => {
      chai.request(server)
        .post('/api/settings')
        .set('Authorization', `bearer ${token}`)
        .send({ name: 'Rob', zipcode: 99999 })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.equal('zipcode must be a valid US zipcode');
          done();
        });
    });
    it('responds with the updated settings', (done) => {
      chai.request(server)
        .post('/api/settings')
        .set('Authorization', `bearer ${token}`)
        .send({ name: 'Rob', zipcode: 90210 })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.name).to.equal('Rob');
          expect(res.body.zipcode).to.equal(90210);
          expect(res.body.city).to.equal('Beverly Hills');
          expect(res.body.state).to.equal('California');
          done();
        });
    });
  });
  describe('GET /api/library', () => {
    it('requires authorization', (done) => {
      chai.request(server)
        .get('/api/library')
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.equal('Not authorized');
          done();
        });
    });
    it('returns the library', (done) => {
      chai.request(server)
        .get('/api/library')
        .set('Authorization', `bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(Array.isArray(res.body)).to.be.true;
          expect(res.body.length).to.equal(3);
          expect(res.body[0]).to.equal('a');
          expect(res.body[1]).to.equal('b');
          expect(res.body[2]).to.equal('c');
          done();
        });
    });
  });
  describe('POST /api/library/:id', () => {
    before(async () => {
      // reset the library
      await user.update({ library: ['one'] });
    });
    it('requires authorization', (done) => {
      chai.request(server)
        .post('/api/library/ABC')
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.equal('Not authorized');
          done();
        });
    });
    it('complains about adding duplicate books', (done) => {
      chai.request(server)
        .post('/api/library/one')
        .set('Authorization', `bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.equal('Volume already in library');
          done();
        });
    });
    it('adds the matching ID', (done) => {
      chai.request(server)
        .post('/api/library/ABC')
        .set('Authorization', `bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.length).to.equal(2);
          expect(res.body[0]).to.equal('one');
          expect(res.body[1]).to.equal('ABC');
          done();
        });
    });
  });
  describe('DELETE /api/library/:id', () => {
    before(async () => {
      // reset the library
      await user.update({ library: [4, 7, 3, 9] });
    });
    it('requires authorization', (done) => {
      chai.request(server)
        .delete('/api/library/ABC')
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.equal('Not authorized');
          done();
        });
    });
    it('complains when the ID is not in the library', (done) => {
      chai.request(server)
        .delete('/api/library/ABC')
        .set('Authorization', `bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.equal('Volume ID not found in library');
          done();
        });
    });
    it('removes the matching ID', (done) => {
      chai.request(server)
        .delete('/api/library/3')
        .set('Authorization', `bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.length).to.equal(3);
          expect(res.body[0]).to.equal('4');
          expect(res.body[1]).to.equal('7');
          expect(res.body[2]).to.equal('9');
          done();
        });
    });
  });
  describe('GET /api/books', () => {
    before(async () => {
      await User.where('_id').nin([user._id]).remove(); // delete all users except the main one
      await Promise.all([
        user.update({ library: ['A', 'B', 'C'] }),
        User.create([
          {
            username: 'tom', password: 'guest', library: [1, 2, 3], city: 'AA', state: 'BB',
          },
          {
            username: 'joe', name: 'Joseph', password: 'guest', library: [9, 'A', 1],
          },
        ]),
      ]);
    });
    it('without auth returns all users and books', (done) => {
      chai.request(server)
        .get('/api/books')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.length).to.equal(3);
          const totalBooks = res.body.reduce((acc, u) => acc + u.library.length, 0);
          expect(totalBooks).to.equal(9);
          done();
        });
    });
    it('with auth returns all other users and books', (done) => {
      chai.request(server)
        .get('/api/books')
        .set('Authorization', `bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.length).to.equal(2);
          const totalBooks = res.body.reduce((acc, u) => acc + u.library.length, 0);
          expect(totalBooks).to.equal(6);
          expect(res.body[0].city).to.equal('AA');
          expect(res.body[1].user).to.equal('joe');
          expect(res.body[1].name).to.equal('Joseph');
          done();
        });
    });
  });
  describe('GET /api/trades', () => {
    before(async () => {
      const [[sam, pam]] = await Promise.all([
        User.create([
          { username: 'sam', password: 'guest', library: ['Q', 'W', 'E'] },
          { username: 'pam', password: 'guest', library: ['R', 'T', 'Y'] },
        ]),
        Trade.remove().exec(),
        user.update({ library: ['A', 'S', 'D', 'F'] }),
      ]);
      await Trade.create([
        { requestedBy: sam, owner: pam, book: 'Q' }, // wont show
        { requestedBy: sam, owner: user, book: 'S' }, // outgoing
        { requestedBy: pam, owner: user, book: 'D' }, // outgoing
        { requestedBy: user, owner: sam, book: 'W' }, // incomming
        { requestedBy: user, owner: pam, book: 'Y' }, // incomming
      ]);
    });
    it('requires authorization', (done) => {
      chai.request(server)
        .get('/api/trades')
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.equal('Not authorized');
          done();
        });
    });
    it('responds with a list of incomming and outgoing trades', (done) => {
      chai.request(server)
        .get('/api/trades')
        .set('Authorization', `bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.incomming.length).to.equal(2);
          expect(res.body.outgoing.length).to.equal(2);
          done();
        });
    });
  });
  describe('POST /api/trade', () => {
    before(async () => {
      await User.create({
        username: 'jeff',
        password: '123',
        library: ['X', 'Y', 'Z'],
      });
    });
    it('requires authorization', (done) => {
      chai.request(server)
        .post('/api/trade')
        .send({ user: 'jeff', book: 'Y' })
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.equal('Not authorized');
          done();
        });
    });
    it('requires a user', (done) => {
      chai.request(server)
        .post('/api/trade')
        .set('Authorization', `bearer ${token}`)
        .send({ book: 'Y' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.equal('user and book are required');
          done();
        });
    });
    it('requires a book', (done) => {
      chai.request(server)
        .post('/api/trade')
        .set('Authorization', `bearer ${token}`)
        .send({ user: 'jeff' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.equal('user and book are required');
          done();
        });
    });
    it('complains if the user does not exist', (done) => {
      chai.request(server)
        .post('/api/trade')
        .set('Authorization', `bearer ${token}`)
        .send({ user: 'harrypotter', book: 'Y' })
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.equal('harrypotter not found');
          done();
        });
    });
    it('complains if the user does not have the book', (done) => {
      chai.request(server)
        .post('/api/trade')
        .set('Authorization', `bearer ${token}`)
        .send({ user: 'jeff', book: 'D' })
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.equal('jeff does not have volume with id D');
          done();
        });
    });
    it('responds with the newly created trade proposal', (done) => {
      chai.request(server)
        .post('/api/trade')
        .set('Authorization', `bearer ${token}`)
        .send({ user: 'jeff', book: 'Y' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.id).to.exist;
          expect(res.body.requestedBy).to.equal('Bob');
          expect(res.body.owner).to.equal('jeff');
          expect(res.body.book).to.equal('Y');
          done();
        });
    });
  });
  describe('DELETE /api/trade/:id', () => {
    let tradeId;
    let rachelToken;
    before(async () => {
      const [, rachel] = await Promise.all([
        Trade.remove().exec(),
        User.create({ username: 'rachel', password: 'mesa', library: ['it'] }),
      ]);
      const trade = await Trade.create({
        requestedBy: user,
        owner: rachel,
        book: 'it',
      });
      tradeId = trade._id;
      rachelToken = jwt.sign({ sub: rachel._id }, process.env.jwtSecret);
    });
    it('requires authorization', (done) => {
      chai.request(server)
        .delete(`/api/trade/${tradeId}`)
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.equal('Not authorized');
          done();
        });
    });
    it('complains about wrong trade ids', (done) => {
      chai.request(server)
        .delete('/api/trade/not-valid-trade-id')
        .set('Authorization', `bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.equal('Trade not-valid-trade-id not found');
          done();
        });
    });
    it('requires that you are the requester', (done) => {
      chai.request(server)
        .delete(`/api/trade/${tradeId}`)
        .set('Authorization', `bearer ${rachelToken}`)
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.equal('Not authorized');
          done();
        });
    });
    it('responds with a success message', (done) => {
      chai.request(server)
        .delete(`/api/trade/${tradeId}`)
        .set('Authorization', `bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.deleted).to.be.true;
          done();
        });
    });
  });
  describe('PUT /api/trade/:id/reject', () => {
    let tradeId;
    let powlaToken;
    before(async () => {
      const powla = await User.create({
        username: 'powla',
        password: 'asdf',
        library: ['asdf', 'abc'],
      });
      const trade = await Trade.create({
        requestedBy: user,
        owner: powla,
        book: 'asdf',
      });
      tradeId = trade._id;
      powlaToken = jwt.sign({ sub: powla._id }, process.env.jwtSecret);
    });
    it('requires authorization', (done) => {
      chai.request(server)
        .put(`/api/trade/${tradeId}/reject`)
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.equal('Not authorized');
          done();
        });
    });
    it('complains about wrong trade ids', (done) => {
      chai.request(server)
        .put('/api/trade/not-valid-trade-id/reject')
        .set('Authorization', `bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.equal('Trade not-valid-trade-id not found');
          done();
        });
    });
    it('requires that you are the owner', (done) => {
      chai.request(server)
        .put(`/api/trade/${tradeId}/reject`)
        .set('Authorization', `bearer ${token}`)
        .end((err, res) => {
          expect(res.body).to.equal('Not authorized');
          expect(res).to.have.status(401);
          done();
        });
    });
    it('does not swap books', (done) => {
      chai.request(server)
        .put(`/api/trade/${tradeId}/reject`)
        .set('Authorization', `bearer ${powlaToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.rejected).to.be.true;
          User.findOne({ username: 'powla' }).exec().then((powla) => {
            expect(powla.library[0]).to.equal('asdf');
            done();
          });
        });
    });
  });
  describe('PUT /api/trade/:id/approve', () => {
    let tradeId;
    let rodneyToken;
    before(async () => {
      await user.update({ library: ['a1', 'b2', 'c3'] });
      const rodney = await User.create({
        username: 'rodney',
        password: 'asdf',
        library: ['asdf', 'abc'],
      });
      const trade = await Trade.create({
        requestedBy: user,
        owner: rodney,
        book: 'asdf',
      });
      tradeId = trade._id;
      rodneyToken = jwt.sign({ sub: rodney._id }, process.env.jwtSecret);
    });
    it('requires authorization', (done) => {
      chai.request(server)
        .put(`/api/trade/${tradeId}/approve`)
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.equal('Not authorized');
          done();
        });
    });
    it('complains about wrong trade ids', (done) => {
      chai.request(server)
        .put('/api/trade/not-valid-trade-id/approve')
        .set('Authorization', `bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.equal('Trade not-valid-trade-id not found');
          done();
        });
    });
    it('requires that you are the owner', (done) => {
      chai.request(server)
        .put(`/api/trade/${tradeId}/approve`)
        .set('Authorization', `bearer ${token}`)
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.equal('Not authorized');
          done();
        });
    });
    it('swaps the books', (done) => {
      chai.request(server)
        .put(`/api/trade/${tradeId}/approve`)
        .set('Authorization', `bearer ${rodneyToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.approved).to.be.true;
          Promise.all([
            User.findOne({ username: 'rodney' }).exec()
              .then(rodney => expect(rodney.library[0]).to.equal('abc')),
            User.findOne({ username: 'Bob' }).exec()
              .then(bob => expect(bob.library[3]).to.equal('asdf')),
          ]).then(() => done());
        });
    });
  });
});
