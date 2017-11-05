import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Image, Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';

const setDefaultImg = (e) => {
  e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/7/75/Children-404_logo.png';
};

const Pin = ({
  id,
  me,
  url,
  description,
  user,
  likes,
  handleLike,
  handleDelete,
}) => (
  <Card>
    <Image src={url} alt={description} onError={setDefaultImg} />
    {description &&
      <Card.Content>
        <Card.Description>
          {description}
        </Card.Description>
      </Card.Content>
    }
    <Card.Content extra>
      <Button
        basic
        icon="user"
        content={user}
        as={Link}
        to={`/gallery/${user}`}
      />
      {user === me &&
        <Button
          basic
          icon="trash"
          onClick={() => handleDelete(id)}
        />
      }
      <Button
        floated="right"
        label={likes.length}
        icon="heart"
        labelPosition="left"
        color={likes.includes(me) ? 'blue' : null}
        onClick={() => handleLike(id)}
      />
    </Card.Content>
  </Card>
);

Pin.defaultProps = {
  me: '',
  description: '',
};

Pin.propTypes = {
  me: PropTypes.string,
  handleLike: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  user: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  description: PropTypes.string,
  likes: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default Pin;
