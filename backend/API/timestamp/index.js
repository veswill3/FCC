const express = require('express');
const url = require('url');

const app = module.exports = express();
const monthNames = [
  'January', 'February', 'March',
  'April', 'May', 'June', 'July',
  'August', 'September', 'October',
  'November', 'December'
];

app.get('/timestamp', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/timestamp/:date', function (req, res) {
    res.setHeader('Content-Type', 'application/json');

    // try to parse as unix timestamp
    let date = new Date(req.params.date * 1000);
    if (isNaN(date)) {
        // try to parse as natural text
        date = new Date(req.params.date);
    }

    // if we got nothing, return null
    if (isNaN(date)) {
        return res.json({unix: null, natural: null});
    }

    res.json({
        unix: date.getTime() / 1000,
        natural: `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
    });
});