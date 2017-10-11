import React from 'react';
import { shallow } from 'enzyme';
import { Input } from 'semantic-ui-react';
import SearchBar from './SearchBar';

it('renders without crashing', () => {
  shallow(<SearchBar searchHandler={() => {}} />);
});

it('only searches when we enter something other than whitespace', () => {
  const mockFn = jest.fn();
  const wrapper = shallow(<SearchBar searchHandler={mockFn} />);
  expect(mockFn.mock.calls.length).toBe(0);
  wrapper.find(Input).simulate('change', { target: { value: '   ' } });
  wrapper.find(Input).simulate('KeyPress', { key: 'Enter' });
  expect(mockFn.mock.calls.length).toBe(0);
  wrapper.find(Input).simulate('change', { target: { value: 'NYC' } });
  wrapper.find(Input).simulate('KeyPress', { key: 'Enter' });
  expect(mockFn.mock.calls.length).toBe(1);
});
