const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../server');
const jwt = require('jsonwebtoken');
const User = require('mongoose').model('User');
const Pin = require('mongoose').model('Pin');

chai.use(chaiHttp);
const { expect } = chai;

// helper for making requests
const reqUtil = {};
['get', 'post', 'patch', 'delete'].forEach((verb) => {
  reqUtil[verb] = (path, token, data) => new Promise((resolve) => {
    let requester = chai.request(server);
    requester = requester[verb](path);
    if (token) requester = requester.set('Authorization', `bearer ${token}`);
    if (data) requester = requester.send(data);
    requester.end((err, res) => resolve(res));
  });
});

const authChecks = async (xyz) => {
  const res = await xyz;
  expect(res.body).to.equal('Not authorized');
  expect(res).to.have.status(401);
};

describe('/api', () => {
  let bart;
  let bartToken;
  let lisa;
  let lisaToken;
  before(async () => {
    await Promise.all([
      User.remove().exec(), // remove all users
      Pin.remove().exec(), // remove all pins
    ]);
    [bart, lisa] = await User.create([
      { username: 'bart', password: 'guest' },
      { username: 'lisa', password: 'guest' },
    ]);
    await Pin.create([
      { user: bart, url: 'https://www.test.com/img1.jpg' },
      { user: bart, url: 'https://www.test.com/img2.jpg', description: 'a' },
      { user: lisa, url: 'https://www.test.com/img3.jpg' },
      { user: lisa, url: 'https://www.test.com/img4.jpg', description: 'cat' },
      { user: lisa, url: 'https://www.test.com/img5.jpg', description: 'dog' },
    ]);
    bartToken = jwt.sign({ sub: bart._id }, process.env.jwtSecret);
    lisaToken = jwt.sign({ sub: lisa._id }, process.env.jwtSecret);
  });
  describe('POST /api/pins', () => {
    it('requires authorization', async () => {
      authChecks(reqUtil.post('/api/pins'));
    });
    it('requires a url', async () => {
      const res = await reqUtil.post('/api/pins', bartToken);
      expect(res.body).to.equal('url is required');
      expect(res).to.have.status(400);
    });
    it('returns the newly created pin', async () => {
      const cntBefore = await Pin.count();
      const data = {
        url: 'http://www.abc.com/def/ghi.jpg',
        description: 'abc def ghi',
      };
      const res = await reqUtil.post('/api/pins', bartToken, data);
      const cntAfter = await Pin.count();
      expect(cntAfter - cntBefore).to.equal(1);
      expect(res.body.user).to.equal('bart');
      expect(res.body.url).to.equal('http://www.abc.com/def/ghi.jpg');
      expect(res.body.description).to.equal('abc def ghi');
      expect(Array.isArray(res.body.likes)).to.be.true;
      expect(res.body.createdAt).to.exist;
    });
  });
  describe('GET /api/pins', () => {
    before(async () => {
      await Pin.create({ url: 'http://new.pin/img.png', user: lisa });
    });
    it('returns a list of all pins', async () => {
      const res = await reqUtil.get('/api/pins');
      expect(res.body.length > 1).to.be.true;
      expect(res.body[0].url).to.equal('http://new.pin/img.png');
    });
  });
  describe('GET /api/pin/:id', () => {
    let pin;
    before(async () => {
      pin = await Pin.create({
        user: bart,
        url: 'https://www.test/com/img.jpg',
        likes: [lisa, bart],
      });
    });
    it('complains when it cannot find the pin', async () => {
      const res = await reqUtil.get('/api/pin/not-real-pin');
      expect(res.body).to.equal('Pin with id not-real-pin not found');
      expect(res).to.have.status(404);
    });
    it('returns a specific pin', async () => {
      const res = await reqUtil.get(`/api/pin/${pin._id}`);
      expect(res.body.id).to.equal(pin._id.toString());
      expect(res.body.user).to.equal('bart');
      expect(res.body.url).to.equal('https://www.test/com/img.jpg');
      expect(res.body.likes[0]).to.equal('lisa');
      expect(res.body.likes[1]).to.equal('bart');
      expect(res).to.have.status(200);
    });
  });
  describe('PATCH /api/pin/:id', () => {
    let pin1;
    let pin2;
    before(async () => {
      [pin1, pin2] = await Pin.create([
        { user: bart, url: 'https://www.test.com/imgx.jpg' },
        { user: bart, url: 'https://www.test.com/imgy.jpg', likes: [lisa] },
      ]);
    });
    it('requires authorization', async () => {
      authChecks(reqUtil.patch(`/api/pin/${pin1._id}`));
    });
    it('complains when it cannot find the pin', async () => {
      const res = await reqUtil.patch('/api/pin/not-real-pin', lisaToken);
      expect(res.body).to.equal('Pin with id not-real-pin not found');
      expect(res).to.have.status(404);
    });
    it('returns the newly liked pin', async () => {
      const res = await reqUtil.patch(`/api/pin/${pin1._id}`, lisaToken);
      expect(res.body.likes.includes('lisa')).to.be.true;
    });
    it('can also return the now unliked pin', async () => {
      const res = await reqUtil.patch(`/api/pin/${pin2._id}`, lisaToken);
      expect(res.body.likes.includes('lisa')).to.be.false;
    });
  });
  describe('DELETE /api/pin/:id', () => {
    let pin;
    before(async () => {
      pin = await Pin.create({ user: bart, url: 'https://www.test.com/img38.jpg' });
    });
    it('requires authorization', async () => {
      authChecks(reqUtil.delete(`/api/pin/${pin._id}`));
    });
    it('complains when it cannot find the pin', async () => {
      const res = await reqUtil.delete('/api/pin/not-real-pin');
      expect(res.body).to.equal('Pin with id not-real-pin not found');
      expect(res).to.have.status(404);
    });
    it('only allows the owner to delete their pin', async () => {
      const res = await reqUtil.delete(`/api/pin/${pin._id}`, lisaToken);
      expect(res.body).to.equal('Not authorized');
      expect(res).to.have.status(401);
    });
    it('returns the deleted pin', async () => {
      const cntBefore = await Pin.count();
      const res = await reqUtil.delete(`/api/pin/${pin._id}`, bartToken);
      const cntAfter = await Pin.count();
      expect(cntBefore - cntAfter).to.equal(1);
      expect(res.body.user).to.equal('bart');
      expect(res.body.url).to.equal('https://www.test.com/img38.jpg');
      expect(res).to.have.status(200);
      const delPin = await Pin.findById(pin._id);
      expect(delPin).to.equal(null); // aka not found
    });
  });
  describe('GET /api/board/:user', () => {
    before(async () => {
      const homer = await User.create({ username: 'homer', password: 'guest' });
      await Pin.create([
        { user: homer, url: 'https://www.test.com/imga.jpg' },
        { user: homer, url: 'https://www.test.com/imgb.jpg' },
        { user: homer, url: 'https://www.test.com/imgc.jpg' },
        { user: homer, url: 'https://www.test.com/imgd.jpg' },
      ]);
    });
    it('complains when it cannot find the user', async () => {
      const res = await reqUtil.get('/api/board/tooth-fairy');
      expect(res.body).to.equal('User tooth-fairy not found');
      expect(res).to.have.status(404);
    });
    it('returns a list of pins created by the user', async () => {
      const res = await reqUtil.get('/api/board/homer');
      expect(Array.isArray(res.body)).to.be.true;
      expect(res.body.length).to.equal(4);
      expect(res.body[2].user).to.equal('homer');
    });
  });
});
