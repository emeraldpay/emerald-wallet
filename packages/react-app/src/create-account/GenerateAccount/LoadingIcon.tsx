import { CircularProgress } from '@material-ui/core';
import * as React from 'react';

const getLoadingIcon = (props: { loading?: boolean }) => {
  if (props.loading) {
    return (
      <CircularProgress size={25}/>
    );
  }
  return null;
};

export default getLoadingIcon;
