Voting App
==========

Objective: Build a full stack JavaScript app that is functionally similar to this: https://fcc-voting-arthow4n.herokuapp.com/ and deploy it to ~Heroku~ wherever.

It should be live at [https://vesper-fcc-voting-app.glitch.me/](https://vesper-fcc-voting-app.glitch.me/).

## User Stories

- As an authenticated user, I can keep my polls and come back later to access them.
- As an authenticated user, I can share my polls with my friends.
- As an authenticated user, I can see the aggregate results of my polls.
- As an authenticated user, I can delete polls that I decide I don't want anymore.
- As an authenticated user, I can create a poll with any number of possible items.
- As an unauthenticated or authenticated user, I can see and vote on everyone's polls.
- As an unauthenticated or authenticated user, I can see the results of polls in chart form.
- As an authenticated user, if I don't like the options on a poll, I can create a new option.

## Goals

- [X] Continue leveraging Mongo, Node, and Express on the back end
- [X] Experiment with React on the front end
- [X] Client will communicate with the server via REST API
- [X] Add a linter and build process
- [X] Include unit tests for the back end (will experiment with front end tests on the next project)
- [ ] Do NOT use a boilerplate

## Notable Technologies

- Tools
  - ESLint (airbnb)
  - concurrently to start client and server
  - nodemon to watch for changes and restart the server
- Backend
  - Express
  - Mongoose ORM for MongoDB
  - JsonWebToken, Passport, and bcrypt for authentication
  - Mocha and Chai for backend unit tests
- Frontend
  - React with create-react-app for easy setup and tooling
  - Semantic UI (via semantic-ui-react)
  - [Recharts](http://recharts.org/#/en-US/) for react

## Lessons Learned

Here are some rambling notes from lessons learned while implementing this project with several technologies that I have been wanting to try for a while (express, mongo/mongoose, react, webpack, linting, unit testing, client/server split architecture). This is more or less in the order as I went through the project. This voting application is a toy project, and I am sure I could have finished it much faster than I did, but it was a good opportunity to experiment and dive into the dark corners that I had only read about before.

### Adding a linter

This was very easy. A quick google search helped me choose ESLint and their instructions were really straight forward. Initializing presets was a pleasure with its CLI wizard. I took it one step further and added an npm script for this (`npm run lint`). In addition to enforcing a consistent style, it auto-corrected most the parts that were not up to snuff, and even guided me into some better practices like not using `.bind(this)` in JSX props.

I had to add a few customizations to get exactly what I wanted:
- enable experimental syntax (`"parser": "babel-eslint"`)
- ignore a few directories (build and node_modules)
- allow `console.log` on the server side
- allow an underscore in `_id` for mongoose
- ignore jsx in `.js` files on the client side
- let it know that I am running it in a browser on the client and with mocha for tests


### Architecture

I wanted to use an express/node server and a react client. The server should supply all of the data via an API which the client consumes and displays to the user. This means I need a split between client and server. Here is the structure I settled on:

```
voting/
  server/
    server.js
    models/
    routes/
    test/
  client/
    src/
    public/
    build/
```

I split the app into `server/` and `client/` folders. The main entry for the server is `server/server.js` which sets up the mongo database, and starts the express server. On the client side, the app is developed from `client/src` and built/deployed to the `client/build` folder.

### Setting up the React client

As I mentioned above, I did not want to use a boilerplate for anything, so I started to research setting up the react app and more specifically webpack. Holy moly - webpack is awesome, and its getting started page is excellent, but actually attempting to configure it for my project seems like a monumental task. So yeah, I backed down from that stipulation for the moment and used `create-react-app`. This actually has excellent defaults and great tools built into it, like hot reload.

I had to make a few tweaks to get the client and server working together without CORS errors. Specifically, I found a descent post describing how to [use a server with the create-react-app](https://www.fullstackreact.com/articles/using-create-react-app-with-a-server/), which pointed me to setting up a `proxy` in my `client/package.json`. Since then I have found that the `create-react-app` README.md has good directions for this as well. The post also had advice for some convenience npm scripts to easily start the server and client at the same time with `concurrently`, and auto-reloading the server with `nodemon`.

With my build process and tooling setup and working smoothly, I started experimenting with the client side. I choose [Semantic UI React](https://react.semantic-ui.com) so I could make a descent looking front-end without wasting a ton of time. After fleshing out a few components I needed to read up on routing with [React Router](https://reacttraining.com/react-router/), which was fairly painless.

### Authentication

Now that I had most of the moving pieces working together and had some time to experiment on using the client with the server, it was time to flesh out the back-end API. I knew the general concept of authentication, but the devil is in the details, so after a few attempts I went searching for info and found a blog post with an example of [Authentication in React Applications with JWT](https://vladimirponomarev.com/blog/authentication-in-react-apps-jwt). I used that as a guide to implement my `/auth` routes, build my user model, and pass the json web tokens back and forth.

Here is the basic structure behind the auth implementation:

```
server/
  routes/
    /auth
      /auth/register and registerStrategy
          provided a username/password, creates a new User and sends back a token

      /auth/login and loginStrategy
          provided a username/password, looks up a User and sends back the token

    /api
      /api/*
          middleware for all /api routes which looks for the 'Authorization'
          header and decodes the corresponding User (if any)

client/
  Util
    Auth - client side helper utility
      authenticate() - saves the token in localStorage
      isAuthenticated() - check if we have a saved token
      deAuthenticate() - removed the token from localStorage
      getToken() - retrieves the token from localStorage

    nFetch - augments fetch to easily add the Authorization header to a request
```

On the server side, I created two `passport` strategies that correspond to the `/auth/register` and `/auth/login` routes that when provided a username and password will create/look up a User and generate a JSON web token to send back to the client. The client must save this token (localStorage) and provide it as a bearer token in the request header for any endpoints that require authorization, like deleting a Poll. To make this easier, I added some helper utility functions in `client/src/Util.js`.
On the server side in `/api` routes the provided token can be used to verify which user is making the request. To make this easier I added middleware to all `/api` routes that will automatically look for the 'Authorization' header, decode the bearer token, and lookup the corresponding user if it exists and is valid. This can be confusing to setup the first time, but reusing it in the next project will be easy.

With authentication behind me, I got excited and started writing a bit of the API, then playing with it on the client. Any front end framework requires a bit of experience to know what is available, so I always ended up falling down a rabbit hole of UI updates and back-end tinkering, wasting a ton of time - you gotta learn somehow I guess.

### Back-end Testing

After I got tired of playing with the UI, it was time to finalize the API. It did not take long before I got tired of manually testing changes and remembered that I really should be doing TDD, so I started writing back-end tests. Since I was experimenting with new techniques, theses tests are all over the place. I probably have a bunch of unnecessary or overly verbose tests, but whatever.

This was actually really good, because it quickly exposed a bunch of issues I was having with mongo/mongoose. There were a few small things I should have caught, but honestly I have to say that I am a little disappointed with the mongoose implementation and documentation. I was trying to implement a few seemingly simple things that took me a while to figure out were unsupported or awkward to use. One small example was that I need to manually check if IDs are valid or else mongoose freaks out instead of just not finding matching documents - lame.

The biggest example is that mongoose does not support dynamic object keys, which is exactly what I wanted to use for tracking votes by user, like `{ votes: { user1: vote1, user2: vote2, ... } }`. I decided to go the 'unsupported' route and use the `Mixed` schema type. This lead to several headaches where various peices of the `Poll` object would persist sometimes and not others in the database. It took a long time, many google searches, and reading a ton of posted issues to find the correct combination of workarounds. This included trying to use `markModified`, hooking into lower level mongo utilities like `$set` and `$inc`, setting the `{ minimize: false }` flag on the schema, and using `Document#update` instead of `Document#save`. I eventually did get it working, but I feel like this could be better. Then again, maybe I am missing something big about mongo/mongoose philosophy.

Anyway, after I got the persistence issues ironed out, my tests revealed that I was running into a race condition with voting. Since I already had unit tests, making changes with confidence was straightforward. Instead of trying to add locking, I just updated how I was storing data and calculated the totals before sending it to the client.

### Finishing touches

With the back-end squared away and well documented, finishing up the client was pretty easy. I choose not to add any front end or integration tests this time, but I plan on doing that for my next project. The final step was to run the build process and figure out how to server the client from express. The `create-react-app` README had a section on how to set this up which helped out. Basically you add a catchall in the express server that serves the compiled client (`client/build/index.html` in my case), so that all routes will get the react app, and the client side router will jump into action to hook into the appropriate `/api` or `/auth` routes.
