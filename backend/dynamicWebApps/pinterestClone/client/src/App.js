import React, { Component } from 'react';
import {
  Route,
  NavLink,
  Redirect,
} from 'react-router-dom';
import { Auth } from './Util';
import Layout from './Layout';
import AuthForm from './AuthForm';
import Gallery from './Gallery';
import NewPinForm from './NewPinForm';
import PrivateRoute from './PrivateRoute';

class App extends Component {
  state = {
    isAuth: Auth.isAuthenticated(),
    username: Auth.getUsername(),
  };

  handleAuthUpdate = async (token, username) => {
    Auth.authenticate(token, username);
    this.setState({ isAuth: true, username });
  }

  handleSignOut = () => {
    Auth.deAuthenticate();
    this.setState({ isAuth: false, username: '' });
  }

  render() {
    const { isAuth } = this.state;
    const leftItems = [{
      as: NavLink, content: 'New', key: 'new', to: '/new', icon: 'add square',
    }];
    if (isAuth) {
      leftItems.push({
        as: NavLink, content: 'My Pins', key: 'mine', to: `/gallery/${this.state.username}`, icon: 'thumbs up',
      });
    }
    const rightItems = isAuth ?
      [
        {
          as: 'a', content: 'Sign Out', key: 'signout', icon: 'sign out', onClick: this.handleSignOut,
        },
      ] : [
        {
          as: NavLink, content: 'Login', key: 'login', to: '/signin', icon: 'sign in',
        },
        {
          as: NavLink, content: 'Register', key: 'register', to: '/register', icon: 'add user',
        },
      ];
    return (
      <Layout leftItems={leftItems} rightItems={rightItems}>
        <Route exact path="/" render={() => (<Redirect to="/gallery" />)} />
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
        <PrivateRoute path="/new" component={NewPinForm} />
        <Route path="/gallery/:user?" render={props => <Gallery me={this.state.username} {...props} />} />
      </Layout>
    );
  }
}

export default App;
