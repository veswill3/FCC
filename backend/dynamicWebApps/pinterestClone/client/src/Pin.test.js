import React from 'react';
import { shallow } from 'enzyme';
import Pin from './Pin';

const minProps = {
  id: '123',
  url: 'https://www.someplace.com/image.jpg',
  user: 'Jerry',
  likes: [],
  handleLike: () => {},
  handleDelete: () => {},
};

it('renders without crashing', () => {
  shallow(<Pin {...minProps} />);
});

it('calls handleLike when you click the like button', () => {
  const mockFn = jest.fn();
  const wrapper = shallow(<Pin {...minProps} id="abc" handleLike={mockFn} />);
  wrapper.find('[icon="heart"]').simulate('click');
  expect(mockFn.mock.calls.length).toBe(1);
  expect(mockFn).toBeCalledWith('abc');
});

it('indicates if the user has already liked the pin', () => {
  const dumbPinWrapper = shallow(<Pin {...minProps} me="sam" />);
  const awesomePinWrapper = shallow(<Pin {...minProps} likes={['bob', 'sam', 'tom']} me="sam" />);
  expect(dumbPinWrapper.find('[icon="heart"]').prop('color')).not.toBe('blue');
  expect(awesomePinWrapper.find('[icon="heart"]').prop('color')).toBe('blue'); // blue indicates liked
});

it('only shows the delete button if you own the pin', () => {
  const myPinWrapper = shallow(<Pin {...minProps} user="me" me="me" />);
  const tomsPinWrapper = shallow(<Pin {...minProps} user="tom" me="me" />);
  expect(myPinWrapper.find('[icon="trash"]').length).toBe(1);
  expect(tomsPinWrapper.find('[icon="trash"]').length).toBe(0);
});

it('calls handleDelete when you click the delete button', () => {
  const mockFn = jest.fn();
  const wrapper = shallow(<Pin {...minProps} id="xyz" handleDelete={mockFn} user="me" me="me" />);
  wrapper.find('[icon="trash"]').simulate('click');
  expect(mockFn.mock.calls.length).toBe(1);
  expect(mockFn).toBeCalledWith('xyz');
});
