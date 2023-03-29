import { TextField, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { Options } from './flow/types';

const useStyles = makeStyles(
  createStyles({
    field: {
      width: 400,
    },
  }),
);

interface OwnProps {
  onChange(value: Options): void;
}

const WalletOptions: React.FC<OwnProps> = ({ onChange }) => {
  const styles = useStyles();

  const [options, setOptions] = React.useState<Options>({});

  return (
    <form noValidate autoComplete="off">
      <TextField
        className={styles.field}
        helperText="(optional) Wallet Label"
        id="label"
        label="Label"
        value={options.label}
        onChange={({ target: { value } }) => {
          const updated = Object.assign({}, options, { label: value });

          setOptions(updated);
          onChange(updated);
        }}
      />
    </form>
  );
};

export default WalletOptions;
