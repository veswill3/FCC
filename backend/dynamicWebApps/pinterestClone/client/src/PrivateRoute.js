import React from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import {
  Route,
  Redirect,
} from 'react-router-dom';
import { Auth } from './Util';

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => (Auth.isAuthenticated() ? (
      <Component {...props} {...rest} />
    ) : (
      <Redirect to={{ pathname: '/signin', state: { from: props.location } }} />
    ))}
  />
);

PrivateRoute.propTypes = {
  // temporary - https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  location: ReactRouterPropTypes.location,
  component: PropTypes.func.isRequired,
};

PrivateRoute.defaultProps = {
  location: undefined,
};

export default PrivateRoute;
