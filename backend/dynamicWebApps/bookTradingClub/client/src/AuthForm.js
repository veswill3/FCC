import React, { Component } from 'react';
import {
  Link,
  Redirect,
} from 'react-router-dom';
import {
  Button,
  Form,
  Grid,
  Header,
  Image,
  Message,
  Segment,
} from 'semantic-ui-react';
import BookSVG from './book.svg';
import { nFetch } from './Util';

class AuthForm extends Component {
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
      .catch(({ error }) => {
        this.setState({ error });
        setTimeout(() => this.setState({ error: '' }), 3000);
      });
  }

  render() {
    const {
      done, isReg, error, username, password, confirm,
    } = this.state;

    if (done) {
      return (<Redirect to="/dashboard" />);
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
              <Image src={BookSVG} />
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
                >
                  {isReg ? 'Register' : 'Login'}
                </Button>
              </Segment>
            </Form>
            {isReg ? (
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

export default AuthForm;
