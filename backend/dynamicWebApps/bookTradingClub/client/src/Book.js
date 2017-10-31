import React from 'react';
import {
  Card,
  Image,
} from 'semantic-ui-react';

const Book = ({ children, ...props }) => (
  <Card>
    <Card.Content>
      <Image src={props.cover} floated="right" />
      <Card.Header>
        {props.title}
      </Card.Header>
      <Card.Meta>
        by {props.authors}
      </Card.Meta>
      {props.requestedBy &&
        <Card.Description>
          <strong>{props.requestedBy}</strong> would like your copy
        </Card.Description>
      }
      {props.owner &&
        <Card.Description>
          You asked for <strong>{props.owner}</strong>&#39;s copy
        </Card.Description>
      }
    </Card.Content>
    <Card.Content extra>
      {children}
    </Card.Content>
  </Card>
);

export default Book;
