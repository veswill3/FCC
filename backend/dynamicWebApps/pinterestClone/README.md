Build a Pinterest Clone
=======================

## Objective

Build a full stack JavaScript app that is functionally similar to this: https://midnight-dust.hyperdev.space and deploy it to ~Heroku~ wherever.

It should be live at https://vcw-fcc-pinterest.glitch.me/

## User Stories

- As an unauthenticated user, I can login with ~Twitter~. (I dont use twitter so it is just username/pass)
- As an authenticated user, I can link to images.
- As an authenticated user, I can delete images that I've linked to.
- As an authenticated user, I can see a Pinterest-style wall of all the images I've linked to.
- As an unauthenticated user, I can browse other users' walls of images.
- As an authenticated user, if I upload an image that is broken, it will be replaced by a placeholder image. (can use jQuery broken image detection)

Hint: Masonry.js is a library that allows for Pinterest-style image grids.

## Goals

- [X] unit tests for the backend
- [X] TDD backend API
- [X] add some tests for the front end
- [X] rapid dev front end with React and Semantic UI

## Notable Technologies

- Tools
  - ESLint (airbnb)
  - concurrently to start client and server
  - nodemon to watch for changes and restart the server
  - webpack (front end only)
- Backend
  - Express
  - Mongoose ORM for MongoDB
  - JsonWebToken, Passport, and bcrypt for authentication
  - Mocha and Chai for backend tests
- Frontend
  - React with create-react-app for easy setup and tooling
  - Masonry (via react-masonry-component) for image layout
  - Semantic UI (via semantic-ui-react)
  - Jest with Enzyme for front end unit tests
