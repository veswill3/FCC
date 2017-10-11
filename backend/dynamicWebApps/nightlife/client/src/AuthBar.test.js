import React from 'react';
import { shallow } from 'enzyme';
import { Form } from 'semantic-ui-react';
import AuthBar from './AuthBar';

it('renders without crashing', () => {
  shallow(<AuthBar updateAuth={() => {}} />);
});

it('can toggle between register and login', () => {
  const wrapper = shallow(<AuthBar updateAuth={() => {}} />);
  expect(wrapper.state('isRegister')).toBe(true);
  wrapper.find('a').simulate('click'); // its the only anchor
  expect(wrapper.state('isRegister')).toBe(false);
});

it('keeps the register button disabled until ready', () => {
  const wrapper = shallow(<AuthBar updateAuth={() => {}} />);
  expect(wrapper.find(Form.Button).prop('disabled')).toBe(true);
  // I could not get simulate to work with typeing into the input fields
  wrapper.setState({ username: 'Bob', password: '', confirm: '' });
  expect(wrapper.find(Form.Button).prop('disabled')).toBe(true);
  wrapper.setState({ username: 'Bob', password: 'pass', confirm: '' });
  expect(wrapper.find(Form.Button).prop('disabled')).toBe(true);
  wrapper.setState({ username: 'Bob', password: 'pass', confirm: 'wrong' });
  // confirm is different, not good enough
  expect(wrapper.find(Form.Button).prop('disabled')).toBe(true);
  wrapper.setState({ username: 'Bob', password: 'pass', confirm: 'pass' });
  // only disable when you have username, password, and matching confirm
  expect(wrapper.find(Form.Button).prop('disabled')).toBe(false);
});

it('keeps the login button disabled until ready', () => {
  const wrapper = shallow(<AuthBar updateAuth={() => {}} />);
  wrapper.find('a').simulate('click'); // switch to login flow
  expect(wrapper.find(Form.Button).prop('disabled')).toBe(true);
  // I could not get simulate to work with typeing into the input fields
  wrapper.setState({ username: 'Bob', password: '' });
  expect(wrapper.find(Form.Button).prop('disabled')).toBe(true);
  wrapper.setState({ username: 'Bob', password: 'pass' });
  // only disable when you have a username and password
  expect(wrapper.find(Form.Button).prop('disabled')).toBe(false);
  wrapper.setState({ username: 'Bob', password: 'pass', confirm: 'abc' });
  // show that in this flow, we dont care what confirm is
  expect(wrapper.find(Form.Button).prop('disabled')).toBe(false);
});
