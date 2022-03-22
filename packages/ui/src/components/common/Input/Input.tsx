/*
Copyright 2019 ETCDEV GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import * as React from 'react';

const getErrorProps = ({errorText}) => {
  const propsToAdd: any = {};

  if (errorText) {
    propsToAdd.helperText = errorText;
    propsToAdd.error = true;
  }

  return propsToAdd;
};

const getAdornments = ({rightIcon, leftIcon}) => {
  const adornments: any = {};

  if (leftIcon) {
    adornments.startAdornment = (<InputAdornment position='start'> {leftIcon} </InputAdornment>);
  }

  if (rightIcon) {
    adornments.endAdornment = (<InputAdornment position='end'>{rightIcon}</InputAdornment>);
  }

  return adornments;
};

const getInputProps = (props) => ({
  InputProps: {...getAdornments(props)}
});

const getMultilineProps = ({multiline, rows, rowsMax}) => {
  let props: any = {};

  if (multiline) {
    props = {rows, rowsMax, multiline};
  }

  return props;
};

interface IInputProps {
  classes?: any;
  value?: string | number;
  multiline?: boolean;
  rowsMax?: number;
  rows?: number;
  disabled?: boolean;
  rightIcon?: any;
  leftIcon?: any;
  placeholder?: string;
  onChange?: any;
  errorText?: any;
  type?: string;
  min?: number | string;
  max?: number | string;
}

export function Input(props: IInputProps) {

  // public static defaultProps = {
  //   value: '',
  //   multiline: false,
  //   rowsMax: null,
  //   rows: null,
  //   disabled: false,
  //   rightIcon: null,
  //   leftIcon: null,
  //   placeholder: '',
  //   onChange: () => {}
  // };

  const multilineProps = getMultilineProps(props as { multiline: any, rows: any, rowsMax: any });
  const errorProps = getErrorProps(props as { errorText: any });
  const inputProps = getInputProps(props);

  return (
    <TextField
      type={props.type}
      value={props.value || ''}
      fullWidth={true}
      margin='normal'
      rows={props.rows}
      rowsMax={props.rowsMax}
      disabled={props.disabled || false}
      placeholder={props.placeholder || ''}
      onChange={props.onChange}
      inputProps={{
        min: props.min,
        max: props.max
      }}
      {...inputProps}
      {...errorProps}
      {...multilineProps}
    />
  );
}

export default Input;
