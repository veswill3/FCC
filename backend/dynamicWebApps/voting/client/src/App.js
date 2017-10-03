import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
} from 'react-router-dom';
import {
  Container,
  Header,
  Image,
  Menu,
  Segment,
} from 'semantic-ui-react';
import VoteSVG from './vote.svg';
import PollList from './PollList';
import PollView from './PollView';
import AuthForm from './AuthForm';
import { Auth } from './Util';
import NewPoll from './NewPoll';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { isAuth: Auth.isAuthenticated() };
    this.handleAuthUpdate = this.handleAuthUpdate.bind(this);
  }

  handleAuthUpdate(token) {
    Auth.authenticate(token);
    this.setState({ isAuth: true });
  }

  render() {
    const isAuth = this.state.isAuth;
    return (
      <Router>
        <div>
          <Menu fixed="top" inverted>
            <Container>
              <Menu.Item as={Link} header to="/">
                <Image
                  size="mini"
                  src={VoteSVG}
                  style={{ marginRight: '1.5em' }}
                />
                FCC Voting App
              </Menu.Item>

              {isAuth && <Menu.Item as={Link} to="/MyPolls">My Polls</Menu.Item>}
              {isAuth && <Menu.Item as={Link} to="/NewPoll">New Poll</Menu.Item>}
              {isAuth &&
                <Route render={({ history }) => (
                  <Menu.Item onClick={() => {
                    Auth.deAuthenticate();
                    this.setState({ isAuth: false });
                    history.replace('/');
                  }}
                  >Sign Out</Menu.Item>
                )}
                />
              }
              {!isAuth && <Menu.Item as={Link} to="/signin">Sign In</Menu.Item>}
              {!isAuth && <Menu.Item as={Link} to="/register">Register</Menu.Item>}

            </Container>
          </Menu>

          <Container style={{ marginTop: '7em' }}>
            <Route path="/" exact component={PollList} />
            <Route path="/MyPolls" component={PollList} />
            <Route path="/NewPoll" component={NewPoll} />
            <Route path="/poll/:id" component={PollView} />
            <Route
              path="/register"
              render={props =>
                <AuthForm {...props} updateAuth={this.handleAuthUpdate} />
              }
            />
            <Route
              path="/signin"
              render={props =>
                <AuthForm {...props} updateAuth={this.handleAuthUpdate} />
              }
            />
          </Container>

          <Segment inverted vertical style={{ margin: '5em 0em 0em', padding: '5em 0em' }}>
            <Container>
              <Header inverted as="h4" content="FCC Voting App" />
              <p>
                Created for the <a href="https://www.freecodecamp.org/challenges/build-a-voting-app">&quot;Build a Voting App&quot; challenge</a> at freeCodeCamp.
                <br />
                Source Code: <a href="https://github.com/veswill3/FCC/tree/master/backend/dynamicWebApps/voting/">veswill3/FCC | backend/dynamicWebApps/voting/</a>
              </p>
            </Container>
          </Segment>
        </div>
      </Router>
    );
  }
}

export default App;
