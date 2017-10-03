import React, { Component } from 'react';
import ReactRouterPropTypes from 'react-router-prop-types';
import {
  Link,
} from 'react-router-dom';
import {
  Grid,
  Button,
  Message,
} from 'semantic-ui-react';
import { nFetch } from './Util';

class PollList extends Component {
  static propTypes = {
    location: ReactRouterPropTypes.location.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      error: '',
      polls: [],
    };
  }

  componentDidMount() {
    const includeAuth = this.props.location.pathname === '/MyPolls';
    nFetch('/api/polls', 'GET', includeAuth)
      .then(polls => this.setState({ polls }))
      .catch(error => this.setState({ error }));
  }

  render() {
    return (
      <Grid>
        <Message error content={this.state.error} hidden={!this.state.error} />
        {this.state.polls.length === 0 &&
          <Message info>
            No polls found. <Link to="/NewPoll">Click here to create one</Link>.
          </Message>
        }
        {this.state.polls.map(poll =>
          (<Grid.Row key={poll.id}>
            <Button
              fluid
              as={Link}
              to={`/poll/${poll.id}`}
              content={poll.title}
            />
          </Grid.Row>),
        )}
      </Grid>
    );
  }
}

export default PollList;
