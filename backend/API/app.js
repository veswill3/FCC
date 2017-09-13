require('dotenv').config()
const express = require('express');
const app = express();

app.use(require('./timestamp'));
app.use(require('./req-head-parser'));
app.use(require('./url-shortener'));
app.use(require('./image-search'));
app.use(require('./file-metadata'));

app.get('/', function (request, response) {
    response.sendFile(__dirname + '/index.html');
});

// listen for requests
const listener = app.listen(process.env.PORT, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});