import React from 'react';
import { IconButton } from 'material-ui';
import { Close as CloseIcon } from 'emerald-js/lib/ui/icons';

const smallIcon = {
    width: '15px',
    height: '15px',
};

const CloseButton = ({ onClick, className }) => {
    return (
        <IconButton
            iconStyle={ smallIcon }
            className={ className }
            onTouchTap={ onClick }
            tooltip="Close">
            <CloseIcon/>
        </IconButton>
    );
};

export default CloseButton;
