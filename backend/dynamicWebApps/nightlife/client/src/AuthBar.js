import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Segment,
  Form,
  Icon,
  Message,
  Input,
  Dimmer,
  Loader,
} from 'semantic-ui-react';
import { nFetch } from './Util';

class AuthBar extends Component {
  static propTypes = {
    updateAuth: PropTypes.func.isRequired,
  }

  state = {
    error: null,
    isRegister: true,
    loading: false,
    username: '',
    password: '',
    confirm: '',
  }

  switchFlow = () => this.setState({ isRegister: !this.state.isRegister })

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleSubmit = () => {
    this.setState({ loading: true });
    const url = this.state.isRegister ? '/auth/register' : '/auth/login';
    const { username, password } = this.state;

    nFetch(url, 'POST', false, { username, password })
      .then(({ token }) => this.props.updateAuth(token))
      .catch(({ error }) => this.setState({ error, loading: false }));
  }

  focusUsernameInput = () => this.usernameInput.focus()

  render() {
    const { username, password, confirm, isRegister, error, loading } = this.state;
    return (
      <Dimmer.Dimmable as={Segment} blurring dimmed={loading}>
        <Dimmer active={loading} inverted>
          <Loader size="large">Loading</Loader>
        </Dimmer>
        {isRegister ?
          <Message
            attached
            header="New around here?"
            content="Sign up below to RSVP and let others know which place is gonna be hopping."
          />
          :
          <Message
            attached
            header="Sign in"
            content="Sign in below to RSVP and let others know which place is gonna be hopping."
          />
        }
        {error && <Message error content={error} />}
        <Form className="attached fluid segment">
          <Form.Group widths="equal">
            <Form.Field>
              <Input
                name="username"
                placeholder="username"
                type="text"
                onChange={this.handleChange}
                ref={(c) => { this.usernameInput = c; }}
              />
            </Form.Field>
            <Form.Input
              name="password"
              placeholder="password"
              type="password"
              onChange={this.handleChange}
            />
            {isRegister &&
              <Form.Input
                name="confirm"
                placeholder="confirm"
                type="password"
                onChange={this.handleChange}
              />
            }
            <Form.Button
              color="blue"
              content={isRegister ? 'Register' : 'Log-In'}
              disabled={!username || !password || (isRegister && password !== confirm)}
              onClick={this.handleSubmit}
            />
          </Form.Group>
        </Form>
        { isRegister ?
          <Message attached="bottom" warning>
            <Icon name="help" />
            Already signed up?&nbsp;
            <a onClick={this.switchFlow} role="link" tabIndex={0}>
              Login here
            </a>&nbsp;instead.
          </Message>
          :
          <Message attached="bottom" warning>
            <Icon name="help" />
            New around here?&nbsp;
            <a onClick={this.switchFlow} role="link" tabIndex={0}>
              Register here
            </a>&nbsp;instead.
          </Message>
        }
      </Dimmer.Dimmable>
    );
  }
}

export default AuthBar;
