const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const User = require('mongoose').model('User');

chai.use(chaiHttp);
const { expect } = chai;

describe('/auth', () => {
  before(() => {
    // clear out all users
    User.remove().exec()
      .then(() => User.create({ username: 'Joe', password: 'guest' }));
  });
  describe('POST /auth/register', () => {
    it('requires a username', (done) => {
      chai.request(server)
        .post('/auth/register')
        .send({ password: 'guest' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.equal('Missing username or password');
          done();
        });
    });
    it('requires a password', (done) => {
      chai.request(server)
        .post('/auth/register')
        .send({ username: 'newuser' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.equal('Missing username or password');
          done();
        });
    });
    it('requires a new username', (done) => {
      chai.request(server)
        .post('/auth/register')
        .send({ username: 'Joe', password: '1234' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.equal('Unable to register');
          done();
        });
    });
    it('returns a token', (done) => {
      chai.request(server)
        .post('/auth/register')
        .send({ username: 'Charlie', password: 'unicorn' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.token).to.exist;
          done();
        });
    });
  });
  describe('POST /auth/login', () => {
    it('requires a username', (done) => {
      chai.request(server)
        .post('/auth/login')
        .send({ password: 'guest' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.equal('Missing username or password');
          done();
        });
    });
    it('requires a password', (done) => {
      chai.request(server)
        .post('/auth/login')
        .send({ username: 'newuser' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.equal('Missing username or password');
          done();
        });
    });
    it('requires the correct password', (done) => {
      chai.request(server)
        .post('/auth/login')
        .send({ username: 'Joe', password: 'wrong' })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.equal('Incorrect username or password');
          done();
        });
    });
    it('responds with the token', (done) => {
      chai.request(server)
        .post('/auth/login')
        .send({ username: 'Joe', password: 'guest' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.token).to.exist;
          done();
        });
    });
  });
});
