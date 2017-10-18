const express = require('express');
const WebSocket = require('ws');
const yahooFinance = require('yahoo-finance');

// setup express app
const app = express();

// serve everything from public
app.use(express.static('public'));

// send back historical stock data
app.get('/api/history/:symbols', async (req, res) => {
  const symbols = req.params.symbols.split(',');
  try {
    const data = await yahooFinance.historical({
      symbols,
      from: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    });
    return res.json(data);
  } catch (error) {
    console.log('Error in GET /api/history/:symbols', error);
  }
  return res.status(400);
});

// start the server
const listener = app.listen(3000, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});

// add a websocket server
const wss = new WebSocket.Server({ server: listener });

// helper to Broadcast to all
const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

const stocks = new Set(); // in memory database
const isSymValid = async (symbol) => {
  try {
    const data = await yahooFinance.quote({ symbol });
    if (data) {
      return true;
    }
  } catch (error) { /* ignore */ }
  return false;
};
const sendError = (ws, error) => ws.send(JSON.stringify({ type: 'error', error }));

wss.on('connection', (ws) => {
  // send all the current stocks
  ws.send(JSON.stringify({ type: 'init', stocks: Array.from(stocks) }));

  // handle messages from the client
  ws.on('message', async (data) => {
    // action = 'add' / 'remove'
    const json = JSON.parse(data);
    let { symbol } = json;
    if (json.action === 'remove') {
      if (!stocks.has(symbol)) {
        sendError(ws, `Symbol ${symbol} not found in the list.`);
        return;
      }
      stocks.delete(symbol);
      broadcast({ type: 'remove', symbol });
    } else if (json.action === 'add') {
      symbol = symbol.toUpperCase();
      if (stocks.has(symbol)) {
        sendError(ws, `Symbol ${symbol} is already in the list.`);
        return;
      }
      if (!(await isSymValid(symbol))) {
        sendError(ws, `No data found for symbol ${symbol}.`);
        return;
      }
      stocks.add(symbol);
      broadcast({ type: 'add', symbol });
    }
  });
});

module.exports = app;
