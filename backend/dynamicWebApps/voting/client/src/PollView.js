import React, { Component } from 'react';
import ReactRouterPropTypes from 'react-router-prop-types';
import {
  Header,
  Container,
  Grid,
  Message,
  Button,
  Input,
} from 'semantic-ui-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { nFetch, Auth } from './Util';

// https://stackoverflow.com/a/20129594
const makeColor = (colorNum, totalColors) => {
  const colors = (totalColors < 1) ? 1 : totalColors;
  return `hsl( ${(colorNum * (360 / colors)) % 360}, 100%, 50% )`;
};

class Poll extends Component {
  static propTypes = {
    history: ReactRouterPropTypes.history.isRequired,
    match: ReactRouterPropTypes.match.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      poll: {},
      error: '',
      newOption: '',
      isAuthenticated: Auth.isAuthenticated(),
    };
  }

  componentDidMount() {
    nFetch(`/api/poll/${this.props.match.params.id}`, 'GET', true)
      .then(poll => this.setState({ poll }))
      .catch(error => this.setState({ error }));
  }

  render() {
    const { poll, newOption, isAuthenticated } = this.state;
    let chartData = [];
    if (poll.votes) {
      chartData = Object.keys(poll.votes).map(opt => ({ name: opt, value: poll.votes[opt] }));
    }

    return (
      <Container>
        <Message error content={this.state.error} hidden={!this.state.error} />

        <Header as="h1">{poll.title}</Header>

        <Grid divided="vertically">
          <Grid.Row>
            <Grid.Column width={6}>
              <Button.Group basic fluid vertical>
                {chartData.map(({ name: option }) =>
                  (<Button
                    key={`vote-for-${option}`}
                    onClick={() => {
                      nFetch(`/api/vote/${poll.id}`, 'POST', true, { vote: option })
                        .then(p => this.setState({ poll: p }))
                        .catch(({ error }) => this.setState({ error }));
                    }}
                    content={option}
                  />),
                )}
              </Button.Group>

              {isAuthenticated &&
                <Input
                  fluid
                  value={newOption}
                  onChange={(e, { value }) => this.setState({ newOption: value })}
                  action={
                    <Button
                      content="Add Option"
                      onClick={() => {
                        nFetch(`/api/poll/${poll.id}`, 'PATCH', true, { newOption })
                          .then(p => this.setState({ poll: p, newOption: '' }))
                          .catch(error => this.setState({ error }));
                      }}
                    />
                  }
                  placeholder="Option..."
                />
              }

            </Grid.Column>
            <Grid.Column style={{ minHeight: '300px' }} width={10}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart style={{ margin: 'auto' }}>
                  <Pie
                    dataKey="value"
                    data={chartData}
                    innerRadius="10%"
                    outerRadius="50%"
                    label={({ name, value }) => (value > 0 ? `${name}: ${value}` : null)}
                  >
                    {chartData.map((dataPt, i) =>
                      <Cell key={dataPt.name} fill={makeColor(i, chartData.length)} />,
                    )}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        {poll.isMyPoll &&
          <Button
            onClick={() => {
              nFetch(`/api/poll/${poll.id}`, 'DELETE', true)
                .then(() => this.props.history.replace('/'))
                .catch(({ error }) => this.setState({ error }));
            }}
            content="Delete"
          />
        }
      </Container>
    );
  }
}

export default Poll;
