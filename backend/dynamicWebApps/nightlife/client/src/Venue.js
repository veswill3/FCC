import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  Icon,
  Image,
  Button,
} from 'semantic-ui-react';

class Venue extends Component {
  static propTypes = {
    rsvpHandler: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
    numGoing: PropTypes.number.isRequired,
    url: PropTypes.string.isRequired,
    amIgoing: PropTypes.bool.isRequired,
    reviews: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })).isRequired,
  }

  state = { intervalId: null, reviewIndex: 0 }

  componentDidMount() {
    if (this.props.reviews.length) {
      const intervalId = setInterval(() => {
        // cylce to next index, but wrap around
        const next = ((this.state.reviewIndex + 1) % this.props.reviews.length);
        this.setState({ reviewIndex: next });
      }, 5000);
      this.setState({ intervalId });
    }
  }

  componentWillUnmount() {
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId);
    }
  }

  render() {
    const { name: reviewName, text: reviewText } = this.props.reviews[this.state.reviewIndex];
    const { id, name, imageUrl, numGoing, url, amIgoing, rsvpHandler } = this.props;

    let rsvpBtnText = 'Flake';
    if (!amIgoing) {
      if (numGoing) rsvpBtnText = 'Join';
      else rsvpBtnText = 'Start a Party';
    }
    return (<Card>
      <Image style={{ maxHeight: '195px' }} src={imageUrl} />
      <Card.Content>
        <Card.Header as="a" href={url}>
          {name}
        </Card.Header>
        <Card.Meta>
          {reviewName} said:
        </Card.Meta>
        <Card.Description>
          {reviewText}
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        <a>
          <Icon name="user" />
          {numGoing} Going
        </a>
        <Button
          floated="right"
          onClick={() => rsvpHandler(id)}
          content={rsvpBtnText}
        />
      </Card.Content>
    </Card>);
  }
}

export default Venue;
