// server.js
// where your node app starts

// init project
var express = require('express');
var url = require('url');
var app = express();

var monthNames = [
  "January", "February", "March",
  "April", "May", "June", "July",
  "August", "September", "October",
  "November", "December"
];

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/:date", function (request, response) {
  response.setHeader('Content-Type', 'application/json');
  
  // try to parse as unix timestamp
  var date = new Date(request.params.date * 1000);
  if (isNaN(date)) {
    // try to parse as natural text
    date = new Date(request.params.date);
  }
  
  // if we got nothing, return null
  if (isNaN(date)) {
    return response.json({unix: null, natural: null});
  }
  
  response.json({
    unix: date.getTime() / 1000,
    natural: `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  });
})

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
