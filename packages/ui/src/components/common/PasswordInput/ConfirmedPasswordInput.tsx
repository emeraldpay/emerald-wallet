import { Button, Grid, TextField, Typography, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import PasswordInput from './PasswordInput';

const useStyles = makeStyles(
  createStyles({
    button: {
      margin: '20px 0 0 10px',
    },
  }),
);

interface OwnProps {
  buttonLabel?: string;
  disabled?: boolean;
  helperText?: string;
  minLength?: number;
  onChange(value: string): void;
}

const ConfirmedPasswordInput: React.FC<OwnProps> = ({
  helperText,
  minLength,
  onChange,
  buttonLabel = 'Enter',
  disabled = false,
}) => {
  const styles = useStyles();

  const [password, setPassword] = React.useState('');
  const [confirmation, setConfirmation] = React.useState('');

  return (
    <Grid container spacing={1}>
      <Grid item xs={4}>
        <PasswordInput onChange={setPassword} disabled={disabled} minLength={minLength} />
      </Grid>
      <Grid item xs={4}>
        <TextField
          fullWidth
          disabled={password === '' || disabled}
          margin="normal"
          placeholder="Confirm password"
          type="password"
          onChange={(event) => setConfirmation(event.target.value)}
        />
      </Grid>
      <Grid item xs={4}>
        <Button
          className={styles.button}
          disabled={disabled || password === '' || confirmation !== password}
          variant="contained"
          onClick={() => onChange(password)}
        >
          {buttonLabel}
        </Button>
      </Grid>
      {helperText != null && (
        <Grid item xs={8}>
          <Typography variant="body2">{helperText}</Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default ConfirmedPasswordInput;
