import { FormLabel, FormRow } from '@emeraldwallet/ui';
import { TextField } from '@mui/material';
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
        defaultValue={options.label}
        placeholder="Optional"
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
