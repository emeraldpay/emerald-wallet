import React from 'react';
import { FlatButton } from 'material-ui';

const style = {
    height: '40px',
    fontSize: '14px',
    fontWeight: '500',
    borderRadius: '1px',
    color: '#fff',
};

const SubmitButton = (props) => {
    const { disabled } = props;
    return (
        <FlatButton
            {...props}
            backgroundColor={ disabled ? '#CBDBCC' : '#47B04B' }
            style={ style } />
    );
};

export default SubmitButton;
