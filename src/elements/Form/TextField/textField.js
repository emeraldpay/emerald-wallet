import React from 'react';
import { TextField as ReduxFormTextField} from 'redux-form-material-ui';

const style = {
    boxSizing: 'border-box',
    height: '51px',
    border: '1px solid #C5C5C5',
    borderRadius: '1px',
    color: '#191919',
    fontSize: '16px',
    lineHeight: '24px',
    paddingLeft: '10px',
    paddingRight: '10px',
};

export const TextField = (props) => (<ReduxFormTextField {...props} style={ style } />);

export default TextField;
