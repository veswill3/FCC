import React, { Component } from 'react';
import {
  Link,
} from 'react-router-dom';
import {
  Header,
  Button,
  Message,
  Card,
  Input,
  Divider,
  Icon,
} from 'semantic-ui-react';
import Book from './Book';
import { Search, VolumeInfo } from './GoogleBooksUtil';
import { nFetch } from './Util';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchResults: null,
      query: '',
      library: [],
      incomming: [],
      outgoing: [],
      error: '',
    };
  }

  componentDidMount = () => {
    this.loadLibrary();
    this.loadTrades();
  }

  loadLibrary = async () => {
    const volumeIds = await nFetch('/api/library', 'GET', true);
    const library = await Promise.all(volumeIds.map(id => VolumeInfo(id)));
    this.setState({ library });
  }

  loadTrades = async () => {
    const trades = await nFetch('/api/trades', 'GET', true);
    const loadBookInfo = async (trade) => {
      const book = await VolumeInfo(trade.book);
      return { ...book, ...trade }; // combine, overwrite book id with trade id
    };
    const [incomming, outgoing] = await Promise.all([
      Promise.all(trades.incomming.map(loadBookInfo)),
      Promise.all(trades.outgoing.map(loadBookInfo)),
    ]);
    this.setState({ incomming, outgoing });
  }

  handleChange = e => this.setState({ [e.target.name]: e.target.value })

  handleSearch = (e) => {
    const { query } = this.state;
    if (query === '') {
      this.setState({ searchResults: null });
    } else if (query.length > 3) {
      Search(query)
        .then(books => this.setState({ searchResults: books }))
        .catch(({ error }) => {
          this.setState({ error });
          setTimeout(() => this.setState({ error: '' }), 3000);
        });
    }
    e.preventDefault();
  }

  clearSearch = () => this.setState({ query: '', searchResults: null })

  handleAdd = async (book) => {
    this.clearSearch();
    const volumeIds = await nFetch(`/api/library/${book.id}`, 'POST', true);
    const library = await Promise.all(volumeIds.map(id => VolumeInfo(id)));
    this.setState({ library });
  };

  handleRemove = async (id) => {
    const volumeIds = await nFetch(`/api/library/${id}`, 'DELETE', true);
    const library = await Promise.all(volumeIds.map(vId => VolumeInfo(vId)));
    this.setState({ library });
  };

  cancelTrade = (id) => {
    nFetch(`/api/trade/${id}`, 'DELETE', true)
      .then(() => this.loadTrades());
  }

  rejectTrade = (id) => {
    nFetch(`/api/trade/${id}/reject`, 'PUT', true)
      .then(() => {
        // just reload trades (this wont affect our libraries)
        this.loadTrades();
      })
      .catch(({ error }) => {
        this.setState({ error });
        setTimeout(() => this.setState({ error: '' }), 3000);
      });
  }

  acceptTrade = (id) => {
    nFetch(`/api/trade/${id}/approve`, 'PUT', true)
      .then(() => {
        // reload trades and library
        this.loadTrades();
        this.loadLibrary();
      })
      .catch(({ error }) => {
        this.setState({ error });
        setTimeout(() => this.setState({ error: '' }), 3000);
      });
  }

  render() {
    return (
      <div>
        <Message error content={this.state.error} hidden={!this.state.error} />

        {this.state.incomming.length > 0 &&
          <div>
            <Header as="h2">Requests for my books</Header>
            <Card.Group>
              {this.state.incomming.map(trade => (
                <Book key={trade.id} {...trade}>
                  <div className="ui two buttons">
                    <Button basic color="green" onClick={() => this.acceptTrade(trade.id)}>Approve</Button>
                    <Button basic color="red" onClick={() => this.rejectTrade(trade.id)}>Reject</Button>
                  </div>
                </Book>
              ))}
            </Card.Group>
            <Divider hidden />
          </div>
        }

        <div>
          <Header as="h2">My requests for books</Header>
          <Card.Group>
            {this.state.outgoing.map(trade => (
              <Book key={trade.id} {...trade}>
                <Button basic color="red" fluid onClick={() => this.cancelTrade(trade.id)}>cancel</Button>
              </Book>
            ))}
          </Card.Group>
          <Message>
            <Icon name="info circle" />
            Add books to this list by requesting them from the <Link to="/books">book list</Link>.
          </Message>
        </div>
        <Divider hidden />
        <div>
          <Header as="h2">My library</Header>
          <Card.Group>
            {this.state.library.map(book => (
              <Book key={book.id} {...book}>
                <Button
                  basic
                  color="red"
                  fluid
                  onClick={() => this.handleRemove(book.id)}
                >Remove
                </Button>
              </Book>
            ))}
          </Card.Group>
          <Divider hidden />
          <Header as="h2">Add books to my library</Header>
          <form onSubmit={this.handleSearch}>
            <Input
              icon="search"
              iconPosition="left"
              type="text"
              placeholder="search for a book"
              name="query"
              value={this.state.query}
              onChange={this.handleChange}
              action={<Button type="submit">Search</Button>}
            />
          </form>
          {this.state.searchResults &&
            <div>
              <p>Results from Google Books</p>
              <Card.Group>
                {this.state.searchResults.map(book => (
                  <Book key={book.id} {...book}>
                    <Button
                      basic
                      color="green"
                      fluid
                      onClick={() => this.handleAdd(book)}
                    >Add
                    </Button>
                  </Book>
                ))}
              </Card.Group>
            </div>
          }
        </div>
      </div>
    );
  }
}

export default Dashboard;
