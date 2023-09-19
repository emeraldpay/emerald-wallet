import { Button, Grid, TextField, Typography, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { PasswordConfirmedInput } from '../../../index';

interface OwnProps {
  isValidMnemonic?: (mnemonic: string) => boolean;
  onSubmit: (mnemonic: string, password: string | undefined) => void;
}

const useStyles = makeStyles((theme) =>
  createStyles({
    mnemonicPhrase: {
      marginBottom: theme.spacing(2),
    },
    saveButton: {
      width: 200,
      margin: 5,
    },
  }),
);

const Component: React.FC<OwnProps> = ({ isValidMnemonic, onSubmit }) => {
  const styles = useStyles();

  const [done, setDone] = React.useState(false);
  const [mnemonic, setMnemonic] = React.useState('');
  const [password, setPassword] = React.useState('');

  const filteredMnemonic = mnemonic.trim().replace(/\s+/g, ' ');
  const isMnemonicValid = isValidMnemonic?.(filteredMnemonic) ?? false;

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography>Enter a mnemonic phrase</Typography>
      </Grid>
      <Grid item xs={12}>
        <Grid container>
          <Grid item xs={8}>
            <TextField
              fullWidth
              multiline
              className={styles.mnemonicPhrase}
              disabled={done}
              maxRows={4}
              minRows={4}
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
            />
            <PasswordConfirmedInput
              buttonLabel={'Set password'}
              disabled={done}
              helperText={
                '(optional) Additional password to protect the secret mnemonic phrase. ' +
                "Please save the password, if you lose it you'll be unable to recover your wallet."
              }
              minLength={1}
              onChange={setPassword}
            />
          </Grid>
          <Grid item xs={4}>
            <Button
              variant={'contained'}
              disabled={done || !isMnemonicValid}
              className={styles.saveButton}
              color={'primary'}
              onClick={() => {
                onSubmit(filteredMnemonic, password.length > 0 ? password : undefined);
                setDone(true);
              }}
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Component;
