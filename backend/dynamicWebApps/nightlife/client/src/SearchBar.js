import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input } from 'semantic-ui-react';

class SearchBar extends Component {
  static propTypes = {
    searchHandler: PropTypes.func.isRequired,
  }

  state = { location: '' }

  handleChange = event => this.setState({ location: event.target.value })

  handleSearch = () => {
    const trimedLoc = this.state.location.trim();
    if (trimedLoc === '') {
      this.setState({ location: '' }); // clear out spaces
    } else {
      this.props.searchHandler(trimedLoc);
    }
  }

  handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.handleSearch();
    }
  }

  render() {
    return (
      <Input
        placeholder="Where you at?"
        value={this.state.location}
        onChange={this.handleChange}
        onKeyPress={this.handleKeyPress}
        action={{
          icon: 'search',
          disabled: this.state.location.trim() === '',
          onClick: this.handleSearch,
        }}
      />
    );
  }
}

export default SearchBar;
