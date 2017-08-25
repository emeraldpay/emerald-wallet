import React from 'react';
import { TextField as ReduxFormTextField } from 'redux-form-material-ui';

const defaultStyle = {
    height: '51px',
    color: '#191919',
    fontSize: '16px',
    lineHeight: '24px',
};

const container = {
    boxSizing: 'border-box',
    border: '1px solid',
    borderColor: '#DDDDDD',
    borderRadius: '1px',
    paddingLeft: '10px',
    paddingRight: '10px',
    display: 'flex',
    alignItems: 'center',
};

export const TextField = (props) => {
    const { rightIcon, invalid, style, ...other } = props;
    if (other.fullWidth) {
        container.width = '100%';
    }

    let containerStyle = invalid ? {...container, borderColor: '#BC0000' } : container;
    if (style) {
        containerStyle = { ...containerStyle, maxHeight: style.maxHeight };
    }

    const textFieldStyle = invalid ? {...defaultStyle, color: '#BC0000' } : defaultStyle;
    return (
        <div style={ containerStyle }>
            <ReduxFormTextField { ...other } style={ textFieldStyle } />{ rightIcon }
        </div>
    );
};

export default TextField;
