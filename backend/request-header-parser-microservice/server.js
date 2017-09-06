var express = require('express');
var app = express();

app.get("/", function (req, res) {
  res.json({
    ipaddress: req.get("x-forwarded-for").split(',')[0],
    language: req.get("accept-language").split(',')[0],
    software: req.get("user-agent").split(/\s*[)(]\s*/)[1]
  });
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
