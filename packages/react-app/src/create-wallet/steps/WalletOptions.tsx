import { FormLabel, FormRow } from '@emeraldwallet/ui';
import { TextField } from '@material-ui/core';
import * as React from 'react';
import { Options } from '../flow/types';

interface OwnProps {
  onChange(value: Options): void;
  onPressEnter?(): void;
}

const WalletOptions: React.FC<OwnProps> = ({ onChange, onPressEnter }) => {
  const [options, setOptions] = React.useState<Options>({});

  return (
    <FormRow last>
      <FormLabel>Label</FormLabel>
      <TextField
        autoFocus
        fullWidth
        placeholder="Optional"
        value={options.label}
        onChange={({ target: { value } }) => {
          const updated = { ...options, label: value };

          setOptions(updated);
          onChange(updated);
        }}
        onKeyDown={({ key }) => {
          if (onPressEnter != null && key === 'Enter') {
            onPressEnter();
          }
        }}
      />
    </FormRow>
  );
};

export default WalletOptions;
