import React from 'react';
import withStyles from 'react-jss';
import CircularProgress from 'material-ui/CircularProgress';

const styles = {
  success: {
    height: '30px',
    width: '81px',
    border: '1px solid #CDEACE',
    borderRadius: '1px',
    color: '#47B04B',
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '10px',
  },
  queue: {
    boxSizing: 'border-box',
    height: '30px',
    width: '117px',
    border: '1px solid #DDDDDD',
    borderRadius: '1px',
    color: '#747474',
    fontSize: '14px',
    lineHeight: '22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '10px',
  },
};

const Status = (props) => {
  const { status, classes } = props;
  if (status === 'success') {
    return (<div className={ classes.success }>Success</div>);
  } else if (status === 'queue') {
    return (
      <div className={ classes.queue }>
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

export default withStyles(styles)(Status);
