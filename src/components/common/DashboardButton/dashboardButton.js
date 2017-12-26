import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import KeyboardArrowLeft from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import { ArrowLeft as ArrowLeftIcon } from 'emerald-js-ui/lib/icons';
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
          <KeyboardArrowLeft color={ style.color }/>
        </div>
        <div>{ label || 'Dashboard' }</div>
      </div>
    </FlatButton>
  );
};

export default DashboardButton;
