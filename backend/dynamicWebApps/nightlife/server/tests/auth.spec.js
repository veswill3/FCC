const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const User = require('mongoose').model('User');

chai.use(chaiHttp);
const expect = chai.expect;

describe('/auth', () => {
  before(() => {
    // clear out all users
    User.remove().exec()
      .then(() => User.create({ username: 'Joe', password: 'guest' }));
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
