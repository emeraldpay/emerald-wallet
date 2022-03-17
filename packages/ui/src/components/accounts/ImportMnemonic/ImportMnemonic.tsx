import { Button, createStyles, Grid, TextField, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { ConfirmedPasswordInput } from '../../../index';

interface OwnProps {
  isValidMnemonic?: (mnemonic: string) => boolean;
  onSubmit: (mnemonic: string, password: string | undefined) => void;
}

const useStyles = makeStyles(
  createStyles({
    saveButton: {
      width: '200px',
      margin: '5px',
    },
  }),
);

const Component: React.FC<OwnProps> = ({ isValidMnemonic, onSubmit }) => {
  const styles = useStyles();

  const [mnemonic, setMnemonic] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [done, setDone] = React.useState(false);

  const filteredMnemonic = mnemonic.trim().replace(/\n*\s+/g, ' ');
  const isMnemonicValid = isValidMnemonic(filteredMnemonic);

  return (
    <Grid container={true}>
      <Grid item={true} xs={12}>
        <Typography>Enter a mnemonic phrase</Typography>
      </Grid>
      <Grid item={true} xs={12}>
        <Grid container={true}>
          <Grid item={true} xs={8}>
            <TextField
              fullWidth={true}
              multiline={true}
              rowsMax={4}
              rows={4}
              value={mnemonic}
              disabled={done}
              onChange={(e) => setMnemonic(e.target.value)}
            />
            <ConfirmedPasswordInput
              helperText={
                '(optional) Additional password to protect the secret mnemonic phrase. ' +
                "Please save the password, if you lose it you'll be unable to recover your wallet."
              }
              disabled={done}
              buttonLabel={'Set password'}
              onChange={setPassword}
            />
          </Grid>
          <Grid item={true} xs={4}>
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
