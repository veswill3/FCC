const mongoose = require('mongoose');

const mongoURI = process.env.NODE_ENV === 'test' ? 'mongodb://localhost/fcc-nightlife' : process.env.DB_URI;

mongoose.connect(mongoURI);

// Use native promises
mongoose.Promise = global.Promise;

mongoose.connection.on('connected', () => {
  console.log(`Mongoose connected to ${mongoURI}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`Mongoose connection error: ${err}`);
  process.exit(1);
});

mongoose.connection.on('disconnected', () => {
  console.log(`Mongoose disconnected from ${mongoURI}`);
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose disconnected through app termination');
    process.exit(0);
  });
});

// load models
require('./user');
require('./event');
