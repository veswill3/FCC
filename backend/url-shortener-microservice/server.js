const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const urlRegex = require('url-regex');

const app = express();
let urlCol, cntCol;

MongoClient.connect(process.env.MONGOLAB_URI, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established to', process.env.MONGOLAB_URI);
    urlCol = db.collection('urls');
    cntCol = db.collection('count');
  }
});

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/new/*', function(req, res) {
  res.setHeader('Content-Type', 'application/json');

  const url = req.url.slice(5); // remove beginning 'new/'

  // check for invalid URLs
  // Make sure it starts with http so we avoid relative redirects
  if (!url.startsWith('http') || !urlRegex({exact: true, strict: true}).test(url)) {
    return res.json({ original_url: url, error: 'invalid url' });
  }

  // check if we already have this URL
  urlCol.findOne({url: url})
  .then(existingDoc => {
    if (existingDoc) {
      return existingDoc;
    } else {
      // create a new document for this URL
      // but first, update the sequence counter
      return cntCol.findOneAndUpdate(
        {_id: 'url_count'},      // query
        { $inc: { 'seq' : 1 } }, // update
      )
      .then(result => result.value.seq)
      // now create our new doc
      .then(newId => urlCol.insertOne({_id: newId, url: url}))
      // only pass along the new doc
      .then(result => result.ops[0]);
    }
  })
  // parse the info and send it to the client
  .then(doc => {
    res.json({
      original_url: url,
      short_url: req.protocol + '://' + req.get('host') + '/' + doc._id
    });
  })
  .catch(err => {
    console.log(err);
    res.status(500).send('Something broke! ' + err);
  });

});

app.get('/:urlId', function(req, res) {
  urlCol.findOne({_id: +req.params.urlId})
  .then(doc => {
    if (doc) {
      res.redirect(doc.url);
    } else {
      res.status(404).send(`url for ${req.params.urlId} not found`);
    }
  })
  .catch(err => {
    console.log(err);
    res.status(500).send('Something broke! ' + err);
  });
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
