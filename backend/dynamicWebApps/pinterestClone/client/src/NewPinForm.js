import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
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

class NewPinForm extends Component {
  state = {
    error: '',
    url: '',
    description: '',
    saved: false,
  }

  handleChange = e => this.setState({ [e.target.name]: e.target.value })

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({ error: '' });
    const { url, description } = this.state;
    nFetch('/api/pins', 'POST', true, { url, description })
      .then(() => this.setState({ saved: true }))
      .catch(({ message }) => this.setState({ error: message }));
  }

  render() {
    const {
      error, url, description, saved,
    } = this.state;

    if (saved) {
      return (<Redirect to="/" />);
    }

    return (
      <Grid textAlign="center" verticalAlign="middle" style={{ height: '100%' }}>
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h2" color="teal" textAlign="center">
            <Image src={logo} />
            Post something new!
          </Header>
          <Message error content={error} hidden={!error} />
          <Form size="large" onSubmit={this.handleSubmit}>
            <Segment stacked>
              <Form.Input
                fluid
                icon="linkify"
                iconPosition="left"
                placeholder="https://www.something.com/awesome.jpg"
                name="url"
                value={url}
                onChange={this.handleChange}
              />
              <Form.Input
                fluid
                icon="info"
                iconPosition="left"
                placeholder="description"
                name="description"
                value={description}
                onChange={this.handleChange}
              />
              <Button
                color="teal"
                fluid
                size="large"
                disabled={!url}
                content="Save"
              />
            </Segment>
          </Form>
        </Grid.Column>
      </Grid>
    );
  }
}

export default NewPinForm;
