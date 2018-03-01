import React from 'react';
import { FontIcon } from 'material-ui';
import CircularProgress from 'material-ui/CircularProgress';
import styles from './status.scss';

const Status = (props) => {
  const { status } = props;
  if (status === 'success') {
    return (<div className={ styles.success }>Success</div>);
  } else if (status === 'queue') {
    return (
      <div className={ styles.queue }>
        <CircularProgress color="black" size={15} thickness={1.5}/>&nbsp; In Queue
      </div>
    );
  }
  return (<div>
        Unknown status
  </div>);
};

export default Status;
