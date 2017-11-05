import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Icon,
  Image,
  Menu,
  Sidebar,
  Responsive,
  Segment,
  Header,
} from 'semantic-ui-react';
import {
  Link,
} from 'react-router-dom';
import logo from './logo.svg';

const NavBarMobile = ({
  children,
  leftItems,
  onPusherClick,
  onToggle,
  rightItems,
  visible,
}) => (
  <Sidebar.Pushable>
    <Sidebar
      as={Menu}
      animation="push"
      width="thin"
      icon="labeled"
      inverted
      items={leftItems.concat(rightItems)}
      vertical
      visible={visible}
      direction="right"
    />
    <Sidebar.Pusher
      dimmed={visible}
      onClick={onPusherClick}
      style={{ minHeight: '100vh' }}
    >
      <Menu fixed="top" inverted>
        <Menu.Item as={Link} header to="/gallery">
          <Image size="mini" src={logo} style={{ marginRight: '1.5em' }} />
          BookShare
        </Menu.Item>
        <Menu.Menu position="right">
          <Menu.Item onClick={onToggle}>
            <Icon name="sidebar" />
          </Menu.Item>
        </Menu.Menu>
      </Menu>
      {children}
    </Sidebar.Pusher>
  </Sidebar.Pushable>
);
NavBarMobile.propTypes = {
  children: PropTypes.node,
  leftItems: PropTypes.arrayOf(PropTypes.object),
  onPusherClick: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
  rightItems: PropTypes.arrayOf(PropTypes.object),
  visible: PropTypes.bool.isRequired,
};
NavBarMobile.defaultProps = {
  children: undefined,
  leftItems: undefined,
  rightItems: undefined,
};

const NavBarDesktop = ({ leftItems, rightItems }) => (
  <Menu fixed="top" inverted>
    <Menu.Item as={Link} header to="/gallery">
      <Image size="mini" src={logo} style={{ marginRight: '1.5em' }} />
      BookShare
    </Menu.Item>
    {leftItems.map(item => <Menu.Item {...item} />)}
    <Menu.Menu position="right">
      {rightItems.map(item => <Menu.Item {...item} />)}
    </Menu.Menu>
  </Menu>
);
NavBarDesktop.propTypes = {
  leftItems: PropTypes.arrayOf(PropTypes.object),
  rightItems: PropTypes.arrayOf(PropTypes.object),
};
NavBarDesktop.defaultProps = {
  leftItems: undefined,
  rightItems: undefined,
};

const NavBarChildren = ({ children }) => (
  <Container fluid style={{ marginTop: '7em' }}>{children}</Container>
);
NavBarChildren.propTypes = { children: PropTypes.node };
NavBarChildren.defaultProps = { children: undefined };

const Footer = () => (
  <Segment inverted vertical style={{ margin: '5em 0em 0em', padding: '2em 0em' }}>
    <Container>
      <Header inverted as="h4" content="FCC Pinterest Clone" />
      <div>
        Created for the <a href="https://www.freecodecamp.org/challenges/build-a-pinterest-clone">&quot;Build a Pinterest Clone&quot; challenge</a> at freeCodeCamp.
      </div>
      <div>
        <Icon name="github" /> <a href="https://github.com/veswill3/FCC/tree/master/backend/dynamicWebApps/pinterestClone/">veswill3/FCC | backend/dynamicWebApps/pinterestClone/</a>
      </div>
    </Container>
  </Segment>
);

class Layout extends Component {
  static propTypes = {
    children: PropTypes.node,
    leftItems: PropTypes.arrayOf(PropTypes.object),
    rightItems: PropTypes.arrayOf(PropTypes.object),
  }
  static defaultProps = {
    children: undefined,
    leftItems: undefined,
    rightItems: undefined,
  }

  state = { visible: false };

  handlePusher = () => {
    if (this.state.visible) this.setState({ visible: false });
  };

  handleToggle = () => this.setState({ visible: !this.state.visible });

  render() {
    const { children, leftItems, rightItems } = this.props;
    const { visible } = this.state;

    return (
      <div>
        <Responsive {...Responsive.onlyMobile}>
          <NavBarMobile
            leftItems={leftItems}
            onPusherClick={this.handlePusher}
            onToggle={this.handleToggle}
            rightItems={rightItems}
            visible={visible}
          >
            <NavBarChildren>{children}</NavBarChildren>
            <Footer />
          </NavBarMobile>
        </Responsive>
        <Responsive minWidth={Responsive.onlyTablet.minWidth}>
          <NavBarDesktop leftItems={leftItems} rightItems={rightItems} />
          <NavBarChildren>{children}</NavBarChildren>
          <Footer />
        </Responsive>
      </div>
    );
  }
}

export default Layout;
