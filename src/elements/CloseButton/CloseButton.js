// @flow
import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import { Close as CloseIcon } from '@emeraldplatform/ui-icons';

const CloseButton = (props: { onClick: any, className?: string }) => {
  return (
    <IconButton
      className={ props.className }
      onClick={ props.onClick }
      tooltip="Close">
      <CloseIcon />
    </IconButton>
  );
};

export default CloseButton;
