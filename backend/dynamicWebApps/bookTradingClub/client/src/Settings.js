import React, { Component } from 'react';
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

class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: '',
      name: '',
      zipcode: '',
      city: '',
      state: '',
      savedMsg: false,
    };
  }

  componentDidMount = async () => {
    const newSettings = await nFetch('/api/Settings', 'GET', true);
    this.setState({ ...newSettings });
  }

  handleChange = e => this.setState({ [e.target.name]: e.target.value })

  handleSubmit = async (e) => {
    e.preventDefault();
    const { name, zipcode } = this.state;
    try {
      const savedSettings = await nFetch('/api/Settings', 'POST', true, { name, zipcode });
      this.setState({ ...savedSettings, savedMsg: true });
      setTimeout(() => this.setState({ savedMsg: false }), 3000);
    } catch ({ error }) {
      this.setState({ error });
      setTimeout(() => this.setState({ error: '' }), 3000);
    }
  }

  render() {
    const {
      name, zipcode, city, state, error, savedMsg,
    } = this.state;
    return (
      <div>
        <Grid textAlign="center" style={{ height: '100%' }} verticalAlign="middle">
          <Grid.Column style={{ maxWidth: 450 }}>
            <Header as="h2" color="teal" textAlign="center">
              <Image src={BookSVG} />
              Settings
            </Header>
            <Message error content={error} hidden={!error} />
            <Message content="Saved!" hidden={!savedMsg} />
            <Form size="large" onSubmit={this.handleSubmit}>
              <Segment stacked>
                <Form.Input
                  fluid
                  icon="address card outline"
                  iconPosition="left"
                  placeholder="name"
                  name="name"
                  value={name}
                  onChange={this.handleChange}
                />
                <Form.Input
                  fluid
                  icon="compass"
                  iconPosition="left"
                  placeholder="zipcode"
                  type="text"
                  name="zipcode"
                  value={zipcode}
                  onChange={this.handleChange}
                />
                {city && <p>Your currently saved location is <strong>{city} {state}</strong></p>}
                <Button color="teal" fluid size="large">Save</Button>
              </Segment>
            </Form>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default Settings;
