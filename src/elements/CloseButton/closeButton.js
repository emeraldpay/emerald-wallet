// @flow
import React from 'react';
import { IconButton } from 'material-ui';
import { Close as CloseIcon } from 'emerald-js-ui/lib/icons3';

const smallIcon = {
  width: '15px',
  height: '15px',
};

const CloseButton = (props: { onClick: any, className: string }) => {
  return (
    <IconButton
      iconStyle={ smallIcon }
      className={ props.className }
      onTouchTap={ props.onClick }
      tooltip="Close">
      <CloseIcon/>
    </IconButton>
  );
};

export default CloseButton;
