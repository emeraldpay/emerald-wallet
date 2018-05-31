// @flow
import React from 'react';
import { SelectField as ReduxFormSelectField} from 'redux-form-material-ui';

const baseStyle = {
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

export const SelectField = (props: { style?: Object }) => {
  const { style } = props;
  return (<ReduxFormSelectField {...props} style={{ ...style, ...baseStyle }} />);
};

export default SelectField;
