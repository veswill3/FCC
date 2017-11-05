require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// setup database
require('./models');

// setup express app
const app = express();
app.use(bodyParser.json());

app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));

// serve client from every other route
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});

module.exports = app;
