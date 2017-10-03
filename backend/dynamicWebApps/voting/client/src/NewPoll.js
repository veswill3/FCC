import React, { Component } from 'react';
import {
  Button,
  Form,
  Grid,
  Header,
  Image,
  Segment,
  Input,
  Icon,
  Message,
} from 'semantic-ui-react';
import { Redirect } from 'react-router-dom';
import VoteSVG from './vote.svg';
import { nFetch, Auth } from './Util';

class NewPoll extends Component {
  state = {
    title: '',
    options: [''],
    error: '',
    newPollId: null,
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value })

  handleOptChange = (e, { name, value }) => {
    const options = this.state.options.slice();
    options[name] = value;
    this.setState({ options });
  }

  addOption = () => {
    // make a copy, but remove dead options
    const options = this.state.options.filter(opt => opt.trim() !== '');
    // add the new one
    options.push('');
    this.setState({ options });
  }

  removeOption = (i) => {
    // make a copy, but remove the ith and dead options
    const options = this.state.options.filter(
      (opt, k) => i !== k && opt.trim() !== '');
    this.setState({ options });
  }

  handleSubmit = () => {
    const title = this.state.title.trim();
    const options = this.state.options.filter(opt => opt.trim() !== '');

    nFetch('/api/polls', 'POST', true, { title, options })
      .then(newPollId => this.setState({ newPollId }))
      .catch(({ error }) => this.setState({ error }));
  }

  render() {
    if (!Auth.isAuthenticated()) {
      return (<Redirect to="/signin" />);
    }
    const { title, options, newPollId, error } = this.state;

    if (newPollId) {
      return (<Redirect to={`/poll/${newPollId}`} />);
    }

    return (
      <Grid
        textAlign="center"
        style={{ height: '100%' }}
        verticalAlign="middle"
      >
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h2" color="teal" textAlign="center">
            <Image src={VoteSVG} />
            {' '}Create a new poll
          </Header>
          <Form size="large">
            <Segment stacked>
              <Form.Field>
                <strong>Title</strong>
                <Input
                  fluid
                  placeholder="title"
                  name="title"
                  value={title}
                  onChange={this.handleChange}
                />
              </Form.Field>

              {options.map((option, i) =>
                // eslint-disable-next-line react/no-array-index-key
                (<Form.Field key={i}>
                  {i === 0 &&
                  <strong>Options</strong>
                  }
                  <Input
                    fluid
                    name={i}
                    placeholder="new option"
                    value={option}
                    onChange={this.handleOptChange}
                    icon={
                      <Icon
                        name="x"
                        inverted
                        circular
                        link
                        onClick={() => this.removeOption(i)}
                      />
                    }
                  />
                </Form.Field>),
              )}

              <Form.Field>
                <Button onClick={this.addOption}>Add Option</Button>
              </Form.Field>

              <Button
                color="teal"
                fluid
                size="large"
                disabled={!title || !options.length}
                onClick={this.handleSubmit}
              >
                Create
              </Button>
            </Segment>
          </Form>
          <Message error content={error} hidden={!error} />
        </Grid.Column>
      </Grid>
    );
  }
}

export default NewPoll;
