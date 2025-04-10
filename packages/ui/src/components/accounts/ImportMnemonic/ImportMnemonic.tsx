import { Button, Grid, TextField, Typography, } from '@mui/material';
import * as React from 'react';
import { PasswordConfirmedInput } from '../../../index';
import {makeStyles} from "tss-react/mui";

interface OwnProps {
  isValidMnemonic?: (mnemonic: string) => boolean;
  onSubmit: (mnemonic: string, password: string | undefined) => void;
}

const useStyles = makeStyles()((theme) => ({
    mnemonicPhrase: {
      marginBottom: theme.spacing(2),
    },
    saveButton: {
      width: 200,
      margin: 5,
    },
  }
));

const Component: React.FC<OwnProps> = ({ isValidMnemonic, onSubmit }) => {
  const styles = useStyles().classes;

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
                '(optional) You can set an additional password for extra protection of your seed phrase.' +
                'Remember to save this password. If it\'s lost, you won\'t be able to access your wallet.'
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
