Nightlife Coordination App
==========================

## Objective

Build a full stack JavaScript app that is functionally similar to this: https://yasser-nightlife-app.herokuapp.com/ and deploy it to ~Heroku~ wherever.

It should be live at [https://vesper-fcc-nightlife.glitch.me](https://vesper-fcc-nightlife.glitch.me).

## User Stories

- As an unauthenticated user, I can view all bars in my area.
- As an authenticated user, I can add myself to a bar to indicate I am going there tonight.
- As an authenticated user, I can remove myself from a bar if I no longer want to go there.
- As an unauthenticated user, when I login I should not have to search again.

Hint: Try using the Yelp API to find venues in the cities your users search for. If you use Yelp's API, be sure to mention so in your app.

## Goals

- Continue with the MERN stack
- Leverage front end testing, in addition to back end testing
- Focus on rapid development instead of constant learning for this project

## Lessons Learned

### Yelp

Hooking into the yelp API was pretty strait forward, especially because there is an NPM package for that. The tricky part was testing. With some research I figured out how to stub the yelp API (which was possible with proxyquire) and define what the responses would be. I actually used real data just to make it realistic. The only weird part was that I only had a hook to my express app from `server.js`, which meant that I could only stub out yelp with proxyquire from there. So I moved the yelp `require` from `routes/api.js` into `server.js` and injected it into the `api`. I am sure there is a better way. Proxyquire actually has a `@global` option but that broke a bunch of stuff.
