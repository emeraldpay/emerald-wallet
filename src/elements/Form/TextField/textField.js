// @flow
import React from 'react';
import { TextField as ReduxFormTextField } from 'redux-form-material-ui';

const defaultStyle = {
  color: '#191919',
  fontSize: '16px',
  lineHeight: '24px',
};

type Props = {
  rightIcon: Element<typeof Icon>,
  leftIcon: Element,
  error: string,
  style: Object,
  fullWidth: boolean,
}

export const TextField = ({ rightIcon, error, style, leftIcon, fieldStyle, ...other }: Props) => {
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

  if (other.fullWidth) {
    container.width = '100%';
  }

  const invalid = error || (other.meta && other.meta.touched && other.meta.error);
  let containerStyle = invalid ? {...container, borderColor: '#BC0000' } : container;
  if (style) {
    containerStyle = { ...containerStyle, maxHeight: style.maxHeight, minWidth: style.minWidth };
  }

  const textFieldStyle = invalid ? {...defaultStyle, color: '#BC0000' } : defaultStyle;
  return (
    <div style={ containerStyle }>
      { leftIcon } <ReduxFormTextField errorStyle={{bottom: '-4px'}} { ...other } style={{...fieldStyle, ...textFieldStyle}} />{ rightIcon }
    </div>
  );
};


export default TextField;
