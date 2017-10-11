import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';
import {
  Menu,
  Container,
  Segment,
  Icon,
  Message,
  Loader,
} from 'semantic-ui-react';
import AuthBar from './AuthBar';
import SearchBar from './SearchBar';
import VenueList from './VenueList';
import { nFetch, Auth } from './Util';

class App extends Component {
  state = {
    isAuth: Auth.isAuthenticated(),
    error: null,
    loading: false,
    location: null,
    data: null,
  }

  handleAuthUpdate = (token) => {
    Auth.authenticate(token);
    this.setState({ isAuth: Auth.isAuthenticated() }, () => this.udpateVenues());
  }

  handleSignOut = () => {
    Auth.deAuthenticate();
    this.setState({ isAuth: false });
  }

  handleSearch = location => this.setState({ location }, () => this.udpateVenues())

  udpateVenues = () => {
    if (!this.state.location) return;
    this.setState({ loading: true });
    nFetch(`/api/venues/${this.state.location}`, 'GET', this.state.isAuth)
      .then(data => this.setState({ data, error: null, loading: false }))
      .catch(({ error }) => this.setState({ error, loading: false }));
  }

  handleRSVP = (id) => {
    if (Auth.isAuthenticated()) {
      this.setState({ loading: true });
      nFetch(`/api/rsvp/${id}`, 'POST', true)
        .then(() => this.udpateVenues())
        .catch(() => this.setState({ isAuth: false, loading: false }));
    } else {
      // take the user to the auth form
      this.authBar.focusUsernameInput();
    }
  }

  render() {
    const { isAuth, error, data, loading } = this.state;
    return (
      <div>
        <Menu fixed="top" inverted>
          <Container>
            <Menu.Item header>
              <Icon name="marker" />
              <Icon name="taxi" />
              <Icon name="cocktail" />
              Plans Tonight?
            </Menu.Item>
            <Menu.Item position="right">
              <SearchBar searchHandler={this.handleSearch} />
            </Menu.Item>
            {isAuth &&
              <Menu.Item
                name="Sign Out"
                onClick={this.handleSignOut}
              />
            }
          </Container>
        </Menu>
        <Container style={{ marginTop: '5em' }}>
          {!isAuth &&
            <AuthBar
              ref={(c) => { this.authBar = c; }}
              updateAuth={this.handleAuthUpdate}
            />
          }
          {error &&
            <Message error content={error} />
          }
          {loading && <Loader active size="large">Loading</Loader>}
          {!error && !data &&
            <Message>
              Search above to see which bars are hoppin&#39; tonight and RSVP ahead of time!
            </Message>
          }
          {data &&
            <VenueList venues={data} rsvpHandler={this.handleRSVP} />
          }
        </Container>

        <Segment inverted style={{ margin: '2em 0em 0em' }}>
          <Container>
            freeCodeCamp <a href="https://www.freecodecamp.org/challenges/build-a-nightlife-coordination-app">Nightlife App</a>
            &nbsp;|&nbsp;
            Powered by <Icon name="yelp" /> Yelp
            &nbsp;|&nbsp;
            Source Code: <a href="https://github.com/veswill3/FCC/tree/master/backend/dynamicWebApps/nightlife">veswill3/FCC&nbsp;&gt;&nbsp;backend/dynamicWebApps/nightlife/</a>
          </Container>
        </Segment>

      </div>
    );
  }
}

export default App;
