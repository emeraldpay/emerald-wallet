import React from 'react';
import withStyles from 'react-jss';
import FlatButton from 'material-ui/FlatButton';
import { Back as BackIcon } from 'emerald-js-ui/lib/icons3';

export const styles = {
  button: {
    fontSize: '14px',
    lineHeight: '24px',
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    marginRight: '5px',
  },
  iconContainer: {
    display: 'flex',
  },
};

export const DashboardButton = (props) => {
  const { onClick, label, classes } = props;
  return (
    <FlatButton onClick={ onClick } >
      <div className={ classes.button }>
        <div className={ classes.iconContainer }>
          <BackIcon />
        </div>
        <div>{ label || 'Dashboard' }</div>
      </div>
    </FlatButton>
  );
};

export default withStyles(styles)(DashboardButton);
