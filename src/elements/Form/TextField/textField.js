import React from 'react';
import { TextField as ReduxFormTextField } from 'redux-form-material-ui';

const style = {
    height: '51px',
    color: '#191919',
    fontSize: '16px',
    lineHeight: '24px',
};

const container = {
    boxSizing: 'border-box',
    border: '1px solid #DDDDDD',
    borderRadius: '1px',
    paddingLeft: '10px',
    paddingRight: '10px',
    display: 'flex',
    alignItems: 'center',
};

export const TextField = (props) => {
    const { fullWidth, rightIcon } = props;
    if (fullWidth) {
        container.width = '100%';
    }
    return (
        <div style={ container }>
            <ReduxFormTextField { ...props } style={ style }/>{ rightIcon }
        </div>
    );
};

export default TextField;
