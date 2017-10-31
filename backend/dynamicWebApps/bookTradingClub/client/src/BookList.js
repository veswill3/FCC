import React, { Component } from 'react';
import {
  Redirect,
} from 'react-router-dom';
import {
  Header,
  Button,
  Card,
  Input,
  Checkbox,
  Segment,
  Divider,
  Message,
} from 'semantic-ui-react';
import { nFetch, Auth } from './Util';
import { VolumeInfo } from './GoogleBooksUtil';
import Book from './Book';

class BookList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      go2login: false,
      location: null,
      userLibraries: [],
      filter: '',
      limitByLocation: false,
    };
  }

  componentDidMount() {
    const isAuth = Auth.isAuthenticated();
    if (isAuth) {
      nFetch('/api/settings', 'GET', true)
        .then(({ city, state }) => this.setState({ location: city + state }));
    }
    nFetch('/api/books', 'GET', isAuth)
      .then(async (data) => {
        const userLibs = await
          Promise.all(data.map(ulib => Promise.all(ulib.library.map(VolumeInfo))
            .then(books => ({
              user: ulib.user,
              name: ulib.name,
              city: ulib.city,
              state: ulib.state,
              library: books,
            }))));
        this.setState({ userLibraries: userLibs, loading: false });
      });
  }

  requestTrade = (user, book, userIdx, bookIdx) => {
    if (Auth.isAuthenticated()) {
      nFetch('/api/trade', 'POST', true, { user, book })
        .then(() => {
          // copy the current list of libraries
          const newUserLibs = this.state.userLibraries.map(uLib =>
            ({ ...uLib, library: uLib.library.map(bk => ({ ...bk })) }));
          // indicate that it was requested
          newUserLibs[userIdx].library[bookIdx].requested = true;
          this.setState({ userLibraries: newUserLibs });
        });
    } else {
      this.setState({ go2login: true });
    }
  }

  render() {
    if (this.state.go2login) {
      return (<Redirect to="/register" />);
    }

    if (this.state.limitByLocation && !this.state.location) {
      return (<Redirect to="/settings" />);
    }

    if (this.state.loading) {
      return (<p>Loading...</p>);
    }

    const filter = this.state.filter.toUpperCase();
    const uLibsFiltered = [];
    this.state.userLibraries.forEach(({
      user, name, city, state, library,
    }) => {
      if (!this.state.limitByLocation || (city + state) === this.state.location) {
        const booksFiltered = library.filter(book =>
          // check if the filter text is found in the title or any of the authors
          [book.title, ...book.authors]
            .some(str => str.toUpperCase().includes(filter)));
        // only add this user if they have some matching books
        if (booksFiltered.length > 0) {
          uLibsFiltered.push({
            user, name, city, state, library: booksFiltered,
          });
        }
      }
    });

    return (
      <div>
        <Segment>
          <Input
            fluid
            icon="filter"
            iconPosition="left"
            type="text"
            name="filter"
            placeholder="Type to filter by title or author"
            value={this.state.filter}
            onChange={e => this.setState({ filter: e.target.value })}
          />
          <Checkbox
            style={{ paddingTop: '1em' }}
            label="Only my city"
            name="limitByLocation"
            checked={this.state.limitByLocation}
            onChange={() => this.setState({ limitByLocation: !this.state.limitByLocation })}
          />
        </Segment>
        { uLibsFiltered.length ?
          uLibsFiltered.map(({
            user,
            name,
            city,
            state,
            library,
          }, userIdx) => (
            <div key={user}>
              <Divider hidden />
              <Header as="h3">{name || user}</Header>
              {city && state && <p>From {city}, {state}</p>}
              <Card.Group>
                {library.map((book, bookIdx) => (
                  <Book key={book.id} {...book}>
                    <Button
                      basic
                      color="green"
                      fluid
                      disabled={book.requested}
                      onClick={() => this.requestTrade(user, book.id, userIdx, bookIdx)}
                      content={book.requested ? 'Requested!' : 'Request'}
                    />
                  </Book>))}
              </Card.Group>
            </div>
          ))
          :
          <Message>
            Nothing found. Maybe try the library.
          </Message>
        }
      </div>
    );
  }
}

export default BookList;
