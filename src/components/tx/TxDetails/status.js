import React from 'react';
import CircularProgress from 'material-ui/CircularProgress';

const styles = {
  success: {
    height: '30px',
    width: '81px',
    border: '1px solid #CDEACE',
    color: '#47B04B',
    display: 'flex',
    borderRadius: '1px',
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '16px',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '10px',
  },

  queue: {
    height: '30px',
    width: '117px',
    border: '1px solid #DDDDDD',
    color: '#747474',
    display: 'flex',
    borderRadius: '1px',
    boxSizing: 'border-box',
    fontSize: '14px',
    lineHeight: '22px',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '10px',
  },
};

const Status = (props) => {
  const { status } = props;
  if (status === 'success') {
    return (<div style={ styles.success }>Success</div>);
  } else if (status === 'queue') {
    return (
      <div style={ styles.queue }>
        <CircularProgress color="black" size={15} thickness={1.5}/>&nbsp; In Queue
      </div>
    );
  }
  return (
    <div>
      Unknown status
    </div>
  );
};

export default Status;
