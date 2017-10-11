import React from 'react';
import { shallow } from 'enzyme';
import VenueList from './VenueList';
import Venue from './Venue';

const minProps = {
  rsvpHandler: () => {},
  venues: [
    { id: '1',
      name: 'venue 1',
      imageUrl: 'http://www.1.com/image.jpg',
      numGoing: 3,
      url: 'http://www.1.com',
      amIgoing: false,
      reviews: [{ name: 'one', text: 'hello' }],
    },
    { id: '2',
      name: 'venue 2',
      imageUrl: 'http://www.2.com/image.jpg',
      numGoing: 0,
      url: 'http://www.2.com',
      amIgoing: true,
      reviews: [{ name: 'two', text: 'hello' }],
    },
    { id: '3',
      name: 'venue 3',
      imageUrl: 'http://www.3.com/image.jpg',
      numGoing: 2,
      url: 'http://www.3.com',
      amIgoing: true,
      reviews: [{ name: 'three', text: 'hello' }],
    },
  ],
};

it('renders without crashing', () => {
  shallow(<VenueList {...minProps} />);
});

it('has the same number of Venue elements as objects in array', () => {
  expect(shallow(<VenueList {...minProps} />).find(Venue).length).toBe(3);
});
