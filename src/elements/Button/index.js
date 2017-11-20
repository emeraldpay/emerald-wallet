import React from 'react';
import { FlatButton } from 'material-ui';

import classes from './button.scss';

const styles = {
  primary: {
    height: '40px',
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: '1px',
    color: '#fff',
  },
  ordinary: {
    height: '40px',
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: '1px',
    backgroundColor: '#EEEEEE',
    color: 'black',
  },
};

const Button = (props) => {
  const { disabled, primary, style } = props;
  if (primary) {
    return (
      <FlatButton
        {...props}
        className={ disabled ? '' : classes.primary }
        backgroundColor={ disabled ? '#A3D7A5' : '#47B04B' }
        style={{ ...styles.primary, ...style }} />
    );
  }
  return (
    <FlatButton
      {...props }
      style={{ ...styles.ordinary, ...style }}
      className={ classes.ordinary }
    />
  );
};

export default Button;
