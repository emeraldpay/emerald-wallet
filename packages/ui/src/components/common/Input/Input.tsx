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

import { InputAdornment, TextField, TextFieldProps } from '@mui/material';
import * as React from 'react';

interface OwnProps {
  autoFocus?: boolean;
  disabled?: boolean;
  errorText?: string | null;
  hintText?: string | null;
  leftIcon?: React.ReactNode;
  max?: number | string;
  maxRows?: number;
  min?: number | string;
  minRows?: number;
  multiline?: boolean;
  placeholder?: string;
  rightIcon?: React.ReactNode;
  type?: string;
  value?: string | number;
  onChange?(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void;
  onPressEnter?(): void;
}

export const Input: React.FC<OwnProps> = ({
  autoFocus,
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
    props.InputProps.startAdornment = <InputAdornment position="start">{leftIcon}</InputAdornment>;
  }

  if (rightIcon) {
    props.InputProps.endAdornment = <InputAdornment position="end">{rightIcon}</InputAdornment>;
  }

  return (
    <TextField
      {...props}
      fullWidth
      autoFocus={autoFocus}
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
