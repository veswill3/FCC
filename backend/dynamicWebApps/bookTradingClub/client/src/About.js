import React from 'react';
import { Icon } from 'semantic-ui-react';

const About = () => (
  <div>
    <h2><Icon name="info circle" />About BookShare</h2>
    <p>
      Do you have a shelf full of books you have already read just collecting dust?
      Why dont you find something new to read, and let someone else enjoy your finished collection?
    </p>
    <p>
      BookShare is a place where you can do just that.
      After you sign up, list the books you dont mind trading in your library.
      Other users can discover these books and request them from you.
      You can browse through books others have listed and find something new to read.
    </p>
    <p>
      In reality, this is a toy project created for freeCodeCamp (see the footer below).
      Maybe in the future we can turn this into a real project, but for now,
      dont be surprised if the BookShare community is a bit lacking.
    </p>
  </div>
);

export default About;
