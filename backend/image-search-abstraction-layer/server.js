const express = require('express');
const https = require('https');
const mongoose = require('mongoose');

const app = express();
const hxSchema = new mongoose.Schema({ term: 'string', when: 'string' });
const History = mongoose.model('History', hxSchema);

app.use(express.static('public'));
mongoose.connect(process.env.MONGOLAB_URI);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// image search for query on page=offset
app.get('/search/:query', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  let searchURL = 'https://www.googleapis.com/customsearch/v1?';
  searchURL += 'q=' + encodeURIComponent(req.params.query); // search query
  searchURL += '&cx=015152746168861962632:phfhosst2p0'; // search engine ID
  searchURL += '&num=10'; // number of results to load
  searchURL += '&searchType=image';
  if (!isNaN(+req.query.offset)) { // calculate the offset
    searchURL += '&start=' + encodeURIComponent(+req.query.offset * 10 + 1);
  }
  searchURL += '&key=' + process.env.GOOGLE_SEARCH_API_KEY; // API key
  
  const search = new Promise((resolve, reject) => {
    https.get(searchURL, (res) => {
      const { statusCode } = res;
      const contentType = res.headers['content-type'];

      let error;
      if (statusCode !== 200) {
        res.resume();
        reject(`Request Failed with Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        res.resume();
        reject(`Invalid content-type. Expected application/json but received ${contentType}`);
      }
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData);
          resolve(parsedData);
        } catch (e) {
          reject(e);
        }
      }).on('error', reject);
    });
  })
  .then(searchResults => {
    const formattedData = [];
    for (let item of searchResults.items) {
      formattedData.push({
        url: item.link,
        snippet: item.snippet,
        thumbnail: item.image.thumbnailLink,
        context: item.image.contextLink
      });
    }
    res.json(formattedData);
  })
  // add to the history
  .then(() => History.create({term: req.params.query, when: (new Date()).toISOString()}))
  .catch(error => {
    console.log(error);
    res.status(500).json(error);
  })
});

// see latest search queries
app.get('/latest/', function(req, res) {
  History.find().limit(10).then((hxItems) => {
    hxItems = hxItems.map(hx => {
      return { term: hx.term, when: hx.when };
    });
    res.json(hxItems);
  });
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
