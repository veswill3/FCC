import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import Masonry from 'react-masonry-component';
import { Message } from 'semantic-ui-react';
import { Redirect } from 'react-router-dom';
import Pin from './Pin';
import { nFetch } from './Util';

class Gallery extends Component {
  static propTypes = {
    me: PropTypes.string,
    match: ReactRouterPropTypes.match.isRequired,
  }

  static defaultProps = {
    me: '',
  }

  state = {
    pins: [],
    goToLogin: false,
    error: '',
  }

  componentDidMount() {
    this.loadPins();
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.user !== prevProps.match.params.user) {
      this.loadPins();
    }
  }

  loadPins = async () => {
    const { user } = this.props.match.params;
    try {
      const pins = await nFetch(user ? `/api/board/${user}` : '/api/pins');
      this.setState({ pins, error: '' });
    } catch ({ message }) {
      this.setState({ error: message, pins: [] });
    }
  }

  likeHandler = async (id) => {
    try {
      const newPin = await nFetch(`/api/pin/${id}`, 'PATCH', true);
      // replace old with the new pin
      const pins = this.state.pins.map(pin => (pin.id === id ? newPin : pin));
      this.setState({ pins, error: '' });
    } catch ({ message, status }) {
      this.setState({ error: message, goToLogin: status === 401 });
    }
  }

  deleteHandler = async (id) => {
    try {
      await nFetch(`/api/pin/${id}`, 'DELETE', true);
      // replace old with the new pin
      const pins = this.state.pins.filter(pin => pin.id !== id);
      this.setState({ pins, error: '' });
    } catch ({ message, status }) {
      this.setState({ error: message, goToLogin: status === 401 });
    }
  }

  render() {
    if (this.state.goToLogin) return (<Redirect to="/signin" />);

    const pins = this.state.pins.map(pin =>
      (<Pin
        key={pin.id}
        {...pin}
        me={this.props.me}
        handleLike={this.likeHandler}
        handleDelete={this.deleteHandler}
      />));
    return (
      <Masonry
        style={{ margin: 'auto' }}
        className="grid"
        elementType="div"
        options={{
          transitionDuration: '0.5s',
          gutter: 30,
          fitWidth: true,
        }}
        disableImagesLoaded={false}
        updateOnEachImageLoad
      >
        <div style={{ width: '290px' }} />
        <Message error content={this.state.error} hidden={!this.state.error} />
        {pins}
      </Masonry>
    );
  }
}

export default Gallery;
