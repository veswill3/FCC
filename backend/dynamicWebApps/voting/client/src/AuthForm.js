import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import {
  Button,
  Form,
  Grid,
  Header,
  Image,
  Message,
  Segment,
} from 'semantic-ui-react';
import {
  Link,
  Redirect,
} from 'react-router-dom';
import VoteSVG from './vote.svg';
import { nFetch } from './Util';

class LoginForm extends Component {
  static propTypes = {
    updateAuth: PropTypes.func.isRequired,
    location: ReactRouterPropTypes.location.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      isRegister: this.props.location.pathname === '/register',
      isAuth: false,
      error: '',
      username: '',
      password: '',
      confirm: '',
    };
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleSubmit = () => {
    const url = this.state.isRegister ? '/auth/register' : '/auth/login';
    const { username, password } = this.state;

    nFetch(url, 'POST', false, { username, password })
      .then(({ token }) => {
        this.props.updateAuth(token);
        this.setState({ isAuth: true });
      })
      .catch(({ error }) => this.setState({ error }));
  }

  render() {
    const { isAuth, isRegister, error, username, password, confirm } = this.state;

    if (isAuth) {
      return (<Redirect to="/" />);
    }

    return (
      <div className="login-form">
        <Grid
          textAlign="center"
          style={{ height: '100%' }}
          verticalAlign="middle"
        >
          <Grid.Column style={{ maxWidth: 450 }}>
            <Header as="h2" color="teal" textAlign="center">
              <Image src={VoteSVG} />
              {isRegister ? ' Create an account' : ' Log-in to your account'}
            </Header>
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
                {isRegister &&
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
                  disabled={!username || !password || (isRegister && password !== confirm)}
                >
                  {isRegister ? 'Register' : 'Login'}
                </Button>
              </Segment>
            </Form>
            <Message error content={error} hidden={!error} />
            {isRegister ? (
              <Message>Already registered? <Link to="/signin">Sign In</Link></Message>
            ) : (
              <Message>New to us? <Link to="/register">Sign Up</Link></Message>
            )}
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default LoginForm;
