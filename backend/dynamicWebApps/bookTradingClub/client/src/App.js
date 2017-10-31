import React, { Component } from 'react';
import {
  Route,
  Redirect,
  NavLink,
} from 'react-router-dom';
import { Auth } from './Util';
import Layout from './Layout';
import About from './About';
import AuthForm from './AuthForm';
import Settings from './Settings';
import Dashboard from './Dashboard';
import BookList from './BookList';

const PrivateRoute = ({ component: RenderComponent, ...rest }) => (
  <Route
    {...rest}
    render={props => (Auth.isAuthenticated() ? (
      <RenderComponent {...props} {...rest} />
    ) : (
      <Redirect to={{ pathname: '/signin', state: { from: props.location } }} />
    ))}
  />
);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { isAuth: Auth.isAuthenticated() };
  }

  handleAuthUpdate = async (token) => {
    Auth.authenticate(token);
    this.setState({ isAuth: true });
  }

  handleSignOut = () => {
    Auth.deAuthenticate();
    this.setState({ isAuth: false });
  }

  render() {
    const { isAuth } = this.state;
    const leftItems = [
      {
        as: NavLink, content: 'Find A Book', key: 'books', to: '/books', icon: 'book',
      },
    ];
    if (isAuth) {
      leftItems.unshift({
        as: NavLink, content: 'Dashboard', key: 'home', to: '/dashboard', icon: 'dashboard',
      });
    }
    const rightItems = isAuth ?
      [
        {
          as: NavLink, content: 'Settings', key: 'settings', to: '/settings', icon: 'setting',
        },
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
        <Route path="/" exact component={About} />
        <Route path="/books" component={BookList} />
        <PrivateRoute path="/settings" component={Settings} />
        <PrivateRoute path="/dashboard" component={Dashboard} />
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
      </Layout>
    );
  }
}

export default App;
