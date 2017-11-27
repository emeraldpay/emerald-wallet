import React from 'react';
import CircularProgress from 'material-ui/CircularProgress';

const getLoadingIcon = (props) => {
  if (props.loading) {
    return (
      <CircularProgress size={25}/>
    );
  }
  return null;
};

export default getLoadingIcon;
