import React from 'react';
import PropTypes from 'prop-types';
import {
  Card,
} from 'semantic-ui-react';
import Venue from './Venue';

const VenueList = ({ venues, rsvpHandler }) =>
  (<Card.Group>
    {venues.map(venueProps =>
      <Venue key={venueProps.id} rsvpHandler={rsvpHandler} {...venueProps} />,
    )}
  </Card.Group>);

VenueList.propTypes = {
  rsvpHandler: PropTypes.func.isRequired,
  venues: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    imageUrl: PropTypes.string,
    numGoing: PropTypes.amIgoing,
    url: PropTypes.string,
    amIgoing: PropTypes.boolean,
    reviews: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      text: PropTypes.string,
    })),
  })).isRequired,
};

export default VenueList;
