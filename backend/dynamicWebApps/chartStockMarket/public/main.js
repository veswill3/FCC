/* global Highcharts */

// create socket so we can listed for updates from the server
const socket = new WebSocket(`wss://${window.location.host}`);

// handle updates to our list of stocks
let stocks;
class StockList {
  constructor(list) {
    // create the chart with the given config
    this.chart = Highcharts.stockChart('chart-here', {
      lang: { noData: 'Add a stock symbol below.' },
      rangeSelector: { selected: 1 },
      title: { text: 'FCC chart the stock market' },
      responsive: {
        rules: [{
          condition: { maxWidth: 500 },
          chartOptions: {
            chart: { height: 300 },
            subtitle: { text: null },
            navigator: { enabled: false },
          },
        }],
      },
    });
    this.listElement = document.getElementById('stock-list');
    this.list = new Set(list);
    if (list.length) {
      // retrive historical data to load into the chart
      const symbols = Array.from(list).join(',');
      fetch(`${window.location.href}api/history/${symbols}`)
        .then(response => response.json())
        .then(data => this.addHxToChart(data));
    }
    this.updateListUI();
  }

  // update the stock list UI
  updateListUI() {
    this.listElement.innerHTML = '';
    this.list.forEach((symbol) => {
      const button = document.createElement('input');
      button.type = 'button';
      button.value = symbol;
      button.classList = 'btn btn-outline-secondary';
      button.onclick = () => socket.send(JSON.stringify({ action: 'remove', symbol }));
      this.listElement.appendChild(button);
    });
  }

  // map data to a series and add it to the chart
  addHxToChart(data) {
    Object.keys(data).forEach((sym) => {
      const hx = data[sym]
        .map(({ date, close }) => [+(new Date(date)), close])
        .reverse();
      this.chart.addSeries({
        id: sym,
        name: sym,
        data: hx,
        tooltip: { valueDecimals: 2 },
      });
    });
  }
  add(symbol) {
    fetch(`${window.location.href}api/history/${symbol}`)
      .then(response => response.json())
      .then(data => this.addHxToChart(data));
    this.list.add(symbol);
    this.updateListUI();
  }
  remove(symbol) {
    this.list.delete(symbol);
    this.updateListUI();
    this.chart.get(symbol).remove();
  }
}

// get handled to a few html elements
const symbolInput = document.getElementById('symbol');
const errorAlert = document.getElementById('error');

// define how to handle messages from the server
socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case 'error':
      errorAlert.innerHTML = data.error;
      errorAlert.style.display = 'block';
      setTimeout(() => { errorAlert.style.display = 'none'; }, 2000);
      break;
    case 'remove':
      stocks.remove(data.symbol);
      break;
    case 'add':
      stocks.add(data.symbol);
      break;
    case 'init':
      stocks = new StockList(data.stocks);
      break;
    default:
      // wat?
  }
});

// hook the new symbol form to the add helper
document.getElementById('add-symbol-form').addEventListener('submit', (e) => {
  const symbol = symbolInput.value.trim();
  if (symbol !== '') {
    socket.send(JSON.stringify({ action: 'add', symbol }));
  }
  symbolInput.value = ''; // clear the input
  e.preventDefault();
});
