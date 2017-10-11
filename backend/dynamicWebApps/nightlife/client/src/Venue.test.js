import React from 'react';
import { shallow } from 'enzyme';
import { Button } from 'semantic-ui-react';
import Venue from './Venue';

const minProps = {
  rsvpHandler: () => {},
  id: '123abc',
  name: 'Mom and pops pizza',
  imageUrl: 'http://www.somewhere.com/image.jpg',
  numGoing: 5,
  url: 'http://www.somewhere.com',
  amIgoing: false,
  reviews: [
    { name: 'one', text: 'hello' },
    { name: 'two', text: 'world' },
  ],
};

it('renders without crashing', () => {
  shallow(<Venue {...minProps} />);
});

it('calls the rsvpHandler when you click the button', () => {
  const mockFn = jest.fn();
  const wrapper = shallow(<Venue {...minProps} rsvpHandler={mockFn} />);
  wrapper.find(Button).simulate('click');
  expect(mockFn.mock.calls.length).toBe(1);
});

it('the rsvp button is titled "Start a Party" if nobody is going', () => {
  const wrapper = shallow(<Venue {...minProps} numGoing={0} amIgoing={false} />);
  expect(wrapper.find(Button).prop('content')).toBe('Start a Party');
});

it('the rsvp button is titled "Join" if others are going', () => {
  const wrapper = shallow(<Venue {...minProps} numGoing={3} amIgoing={false} />);
  expect(wrapper.find(Button).prop('content')).toBe('Join');
});

it('the rsvp button is titled "Flake" if I am going', () => {
  const wrapper = shallow(<Venue {...minProps} amIgoing />);
  expect(wrapper.find(Button).prop('content')).toBe('Flake');
});
