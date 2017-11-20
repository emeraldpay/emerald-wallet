import React from 'react';
import { FlatButton } from 'material-ui';

import classes from './linkButton.scss';

const style = {
  color: '#47B04B',
  height: '40px',
  lineHeight: '40px',
};

const LinkButton = (props) => {
  return (
    <FlatButton
      {...props }
      style={ style }
      className={ classes.linkButton }
    />
  );
};

export default LinkButton;
