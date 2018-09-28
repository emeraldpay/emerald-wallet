import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import { Back as BackIcon } from 'emerald-js-ui/lib/icons3';

const styles = {
  button: {
    fontSize: '14px',
    lineHeight: '24px',
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    marginRight: '5px'
  },
  iconContainer: {
    display: "flex",
  }
};

const DashboardButton = (props) => {
  const { onClick, label } = props;

  return (
    <FlatButton onClick={ onClick } >
      <div styles={ styles.button }>
        <div styles={styles.iconContainer}>
          <BackIcon color={ style.color }/>
        </div>
        <div>{ label || 'Dashboard' }</div>
      </div>
    </FlatButton>
  );
};

export default DashboardButton;
