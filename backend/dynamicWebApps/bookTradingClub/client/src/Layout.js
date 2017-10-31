import React, { Component } from 'react';
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
import BookSVG from './book.svg';

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
        <Menu.Item as={Link} header to="/">
          <Image size="mini" src={BookSVG} style={{ marginRight: '1.5em' }} />
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

const NavBarDesktop = ({ leftItems, rightItems }) => (
  <Menu fixed="top" inverted>
    <Menu.Item as={Link} header to="/">
      <Image size="mini" src={BookSVG} style={{ marginRight: '1.5em' }} />
      BookShare
    </Menu.Item>
    {leftItems.map(item => <Menu.Item {...item} />)}
    <Menu.Menu position="right">
      {rightItems.map(item => <Menu.Item {...item} />)}
    </Menu.Menu>
  </Menu>
);

const NavBarChildren = ({ children }) => (
  <Container style={{ marginTop: '7em' }}>{children}</Container>
);

const Footer = () => (
  <Segment inverted vertical style={{ margin: '5em 0em 0em', padding: '2em 0em' }}>
    <Container>
      <Header inverted as="h4" content="BookShare" />
      <div>
        Created for the <a href="https://www.freecodecamp.org/challenges/manage-a-book-trading-club">&quot;Manage a Book Trading Club&quot; challenge</a> at freeCodeCamp.
      </div>
      <div>
        <Icon name="github" /> <a href="https://github.com/veswill3/FCC/tree/master/backend/dynamicWebApps/bookTradingClub/">veswill3/FCC | backend/dynamicWebApps/bookTradingClub/</a>
      </div>
    </Container>
  </Segment>
);

class Layout extends Component {
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
