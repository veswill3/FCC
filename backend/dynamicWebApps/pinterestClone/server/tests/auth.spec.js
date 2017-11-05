const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const User = require('mongoose').model('User');

chai.use(chaiHttp);
const { expect } = chai;

const post = (path, data) => new Promise(resolve =>
  chai.request(server)
    .post(path)
    .send(data)
    .end((err, res) => resolve(res)));
const register = data => post('/auth/register', data);
const login = data => post('/auth/login', data);

describe('/auth', () => {
  before(async () => {
    await User.remove().exec(); // clear out all users
    await User.create({ username: 'Joe', password: 'guest' });
  });
  describe('POST /auth/register', () => {
    it('requires a username', async () => {
      const res = await register({ password: 'guest' });
      expect(res).to.have.status(400);
      expect(res.body).to.equal('Missing username or password');
    });
    it('requires a password', async () => {
      const res = await register({ username: 'newuser' });
      expect(res).to.have.status(400);
      expect(res.body).to.equal('Missing username or password');
    });
    it('requires a new username', async () => {
      const res = await register({ username: 'Joe', password: '1234' });
      expect(res).to.have.status(400);
      expect(res.body).to.equal('Unable to register');
    });
    it('returns a token', async () => {
      const res = await register({ username: 'Charlie', password: 'unicorn' });
      expect(res).to.have.status(200);
      expect(res.body.token).to.exist;
    });
  });
  describe('POST /auth/login', () => {
    it('requires a username', async () => {
      const res = await login({ password: 'guest' });
      expect(res).to.have.status(400);
      expect(res.body).to.equal('Missing username or password');
    });
    it('requires a password', async () => {
      const res = await login({ username: 'newuser' });
      expect(res).to.have.status(400);
      expect(res.body).to.equal('Missing username or password');
    });
    it('requires the correct password', async () => {
      const res = await login({ username: 'Joe', password: 'wrong' });
      expect(res).to.have.status(400);
      expect(res.body).to.equal('Incorrect username or password');
    });
    it('responds with the token', async () => {
      const res = await login({ username: 'Joe', password: 'guest' });
      expect(res).to.have.status(200);
      expect(res.body.token).to.exist;
    });
  });
});
