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
import { TextFieldProps } from '@material-ui/core/TextField/TextField';
import * as React from 'react';

interface OwnProps {
  disabled?: boolean;
  errorText?: string | null;
  hintText?: string | null;
  leftIcon?: React.ReactElement;
  max?: number | string;
  maxRows?: number;
  min?: number | string;
  minRows?: number;
  multiline?: boolean;
  placeholder?: string;
  rightIcon?: React.ReactElement;
  type?: string;
  value?: string | number;
  onChange?(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void;
  onPressEnter?(): void;
}

export const Input: React.FC<OwnProps> = ({
  disabled,
  errorText,
  hintText,
  leftIcon,
  max,
  min,
  maxRows,
  minRows,
  multiline,
  placeholder,
  rightIcon,
  type,
  value,
  onChange,
  onPressEnter,
}) => {
  let props: TextFieldProps = { InputProps: {} };

  if (errorText != null) {
    props.helperText = errorText;
    props.error = true;
  } else if (hintText != null) {
    props.helperText = hintText;
  }

  if (multiline === true) {
    props = { ...props, maxRows, minRows, multiline };
  }

  if (leftIcon) {
    props.InputProps.startAdornment = <InputAdornment position="start"> {leftIcon} </InputAdornment>;
  }

  if (rightIcon) {
    props.InputProps.endAdornment = <InputAdornment position="end">{rightIcon}</InputAdornment>;
  }

  return (
    <TextField
      {...props}
      fullWidth
      disabled={disabled ?? false}
      inputProps={{ max, min }}
      maxRows={maxRows}
      minRows={minRows}
      placeholder={placeholder ?? ''}
      type={type}
      value={value ?? ''}
      onChange={onChange}
      onKeyDown={({ key }) => {
        if (onPressEnter != null && key === 'Enter') {
          onPressEnter();
        }
      }}
    />
  );
};

export default Input;
