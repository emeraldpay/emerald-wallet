import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import { Back as BackIcon } from 'emerald-js-ui/lib/icons2';
import styles from './dashboardButton.scss';

const style = {
  color: '#747474',
};

const DashboardButton = (props) => {
  const { onClick, label } = props;
  return (
    <FlatButton onClick={ onClick } >
      <div className={ styles.button }>
        <div className={ styles.iconContainer }>
          <BackIcon color={ style.color }/>
        </div>
        <div>{ label || 'Dashboard' }</div>
      </div>
    </FlatButton>
  );
};

export default DashboardButton;
