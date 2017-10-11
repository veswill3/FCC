import React from 'react';
import { shallow } from 'enzyme';
import App from './App';
import AuthBar from './AuthBar';
import VenueList from './VenueList';

it('renders without crashing', () => {
  shallow(<App />);
});

it('shows the auth form depending on state', () => {
  const wrapper = shallow(<App />);
  expect(wrapper.find(AuthBar).length).toBe(1);
  wrapper.setState({ isAuth: true });
  // Auth form should not be hidden, sign out button is availible
  expect(wrapper.find(AuthBar).length).toBe(0);
  const signOutBtn = wrapper.find({ name: 'Sign Out' });
  // clicking the signout button should de auth, and show the auth form again
  signOutBtn.simulate('click');
  expect(wrapper.state('isAuth')).toBe(false);
  expect(wrapper.find(AuthBar).length).toBe(1);
});

it('only shows venues if we have data', () => {
  const wrapper = shallow(<App />);
  expect(wrapper.find(VenueList).length).toBe(0);
  wrapper.setState({ data: [] });
  expect(wrapper.find(VenueList).length).toBe(1);
});

it('alerts the user to errors', () => {
  const wrapper = shallow(<App />);
  expect(wrapper.find({ error: true }).length).toBe(0);
  wrapper.setState({ error: 'something went wrong' });
  const errorWrapper = wrapper.find({ error: true });
  expect(errorWrapper.length).toBe(1);
  expect(errorWrapper.prop('content')).toBe('something went wrong');
});
