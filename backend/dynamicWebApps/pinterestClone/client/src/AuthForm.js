import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import { Link, Redirect } from 'react-router-dom';
import {
  Button,
  Form,
  Grid,
  Header,
  Image,
  Message,
  Segment,
} from 'semantic-ui-react';
import logo from './logo.svg';
import { nFetch } from './Util';

class AuthForm extends Component {
  static propTypes = {
    updateAuth: PropTypes.func.isRequired,
    location: ReactRouterPropTypes.location.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      isReg: this.props.location.pathname === '/register',
      done: false,
      error: '',
      username: '',
      password: '',
      confirm: '',
    };
  }

  handleChange = e => this.setState({ [e.target.name]: e.target.value })

  handleSubmit = (e) => {
    e.preventDefault();
    const url = this.state.isReg ? '/auth/register' : '/auth/login';
    const { username, password } = this.state;

    nFetch(url, 'POST', false, { username, password })
      .then(({ token }) => {
        this.props.updateAuth(token, username);
        this.setState({ done: true });
      })
      .catch(({ message }) => {
        this.setState({ error: message });
        setTimeout(() => this.setState({ error: '' }), 3000);
      });
  }

  render() {
    const {
      done, isReg, error, username, password, confirm,
    } = this.state;

    if (done) {
      return (<Redirect to="/gallery" />);
    }

    return (
      <Grid textAlign="center" verticalAlign="middle" style={{ height: '100%' }}>
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h2" color="teal" textAlign="center">
            <Image src={logo} />
            {isReg ? ' Create an account' : ' Log-in to your account'}
          </Header>
          <Message error content={error} hidden={!error} />
          <Form size="large" onSubmit={this.handleSubmit}>
            <Segment stacked>
              <Form.Input
                fluid
                icon="user"
                iconPosition="left"
                placeholder="Username"
                name="username"
                value={username}
                onChange={this.handleChange}
              />
              <Form.Input
                fluid
                icon="lock"
                iconPosition="left"
                placeholder="Password"
                type="password"
                name="password"
                value={password}
                onChange={this.handleChange}
              />
              {isReg &&
                <Form.Input
                  fluid
                  icon="lock"
                  iconPosition="left"
                  placeholder="Confirm"
                  type="password"
                  name="confirm"
                  value={confirm}
                  onChange={this.handleChange}
                />
              }
              <Button
                color="teal"
                fluid
                size="large"
                disabled={!username || !password || (isReg && password !== confirm)}
                content={isReg ? 'Register' : 'Login'}
              />
            </Segment>
          </Form>
          {isReg ? (
            <Message>Already registered? <Link to="/signin">Sign In</Link></Message>
            ) : (
              <Message>New to us? <Link to="/register">Sign Up</Link></Message>
            )}
        </Grid.Column>
      </Grid>
    );
  }
}

export default AuthForm;
