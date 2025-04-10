import { Box, Grid, TextField, Typography } from '@mui/material';
import * as React from 'react';
import Dropzone from 'react-dropzone';
import { Button, FormLabel, FormRow, PasswordInput } from '../../index';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()({
    dropBox: {
      backgroundColor: '#f0faff',
      border: '1px solid #f0f0f0',
      cursor: 'pointer',
      padding: 40,
      textAlign: 'center',
      width: '100%',
    },
  }
);

interface Web3 {
  address: string;
  crypto: object;
}

function isWeb3(json: unknown): json is Web3 {
  return (
    json != null &&
    typeof json === 'object' &&
    'address' in json &&
    typeof json.address === 'string' &&
    'crypto' in json &&
    typeof json.crypto === 'object'
  );
}

export interface ImportedPk {
  password: string;
  json?: string;
  jsonPassword?: string;
  raw?: string;
}

interface OwnProps {
  raw: boolean;
  checkGlobalKey(password: string): Promise<boolean>;
  onChange(value: ImportedPk): void;
}

const ImportPk: React.FC<OwnProps> = ({ raw, checkGlobalKey, onChange }) => {
  const styles = useStyles().classes;

  const [rawPk, setRawPk] = React.useState('');
  const [jsonPk, setJsonPk] = React.useState('');

  const [jsonAddress, setJsonAddress] = React.useState('');

  const [password, setPassword] = React.useState<string>();
  const [passwordError, setPasswordError] = React.useState<string>();
  const [passwordVerified, setPasswordVerified] = React.useState(false);

  const [jsonPassword, setJsonPassword] = React.useState<string>();
  const [jsonPasswordError, setJsonPasswordError] = React.useState<string>();

  const handleRawPkChange = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>): void => {
    setRawPk(value);

    if (value.length > 0 && password != null && password.length > 0) {
      onChange({ password, raw: value });
    }
  };

  const handleJsonPkDrop = (acceptedFiles: File[]): void => {
    const resolve = (json: string, web3: Web3): void => {
      setJsonPk(json);
      setJsonAddress(web3.address);

      if (json.length > 0 && password != null && password.length > 0) {
        onChange({ json, jsonPassword, password });
      }
    };

    const reject = (err: string): void => {
      console.warn('Failed to read JSON', err);

      setJsonPk(undefined);
      setJsonAddress(undefined);
    };

    if (acceptedFiles.length == 0) {
      reject('File not selected');
    } else {
      const file = acceptedFiles[0];
      const reader = new FileReader();

      reader.onabort = () => {
        reject('file reading was aborted');
      };

      reader.onerror = () => {
        reject('file reading has failed');
      };

      reader.onload = () => {
        const result = reader.result;

        if (typeof result == 'string') {
          const web3 = JSON.parse(result);

          if (isWeb3(web3)) {
            resolve(result, web3);
          } else {
            reject('Not Web3 JSON');
          }
        } else {
          reject('Not a string ' + typeof result);
        }
      };

      reader.readAsText(file);
    }
  };

  const handleJsonPkRemove = (): void => {
    setJsonPk(undefined);
    setJsonAddress(undefined);
  };

  const handleJsonPkPasswordChange = (value: string): void => {
    setJsonPassword(value);

    if (value.length > 0 && password.length > 0) {
      onChange({ json: jsonPk, password, jsonPassword: value });
    }
  };

  const handlePasswordChange = (value: string): void => {
    setPassword(value);
    setPasswordVerified(false);
  };

  const handleRawPkGlobalPasswordChange = async (): Promise<void> => {
    if (password != null) {
      const correctGlobalPassword = await checkGlobalKey(password);

      if (correctGlobalPassword) {
        onChange({ password, raw: rawPk });

        setPasswordError(undefined);
        setPasswordVerified(true);
      } else {
        onChange({ password: '', raw: rawPk });

        setPasswordError('Incorrect password');
        setPasswordVerified(false);
      }
    }
  };

  const handleJsonPkGlobalPasswordChange = async (): Promise<void> => {
    if (password != null) {
      const correctGlobalPassword = await checkGlobalKey(password);

      if (correctGlobalPassword) {
        onChange({ json: jsonPk, jsonPassword, password });

        setJsonPasswordError(undefined);
        setPasswordVerified(true);
      } else {
        onChange({ json: jsonPk, jsonPassword, password: '' });

        setJsonPasswordError('Incorrect password');
        setPasswordVerified(false);
      }
    }
  };

  return raw ? (
    <>
      <FormRow>
        <FormLabel />
        <div>
          <Typography variant="h5">Raw Private Key</Typography>
          <Typography variant="subtitle1">
            Submit an Ethereum Private Key formatted as Hex (66 character string starting with 0x)
          </Typography>
        </div>
      </FormRow>
      <FormRow>
        <FormLabel>Private Key</FormLabel>
        <TextField autoFocus placeholder="0x..." fullWidth={true} onChange={handleRawPkChange} />
      </FormRow>
      <FormRow last>
        <FormLabel>Global password</FormLabel>
        <Grid container alignItems="center" spacing={1}>
          <Grid item xs>
            <PasswordInput
              error={passwordError}
              minLength={1}
              placeholder="Enter existing password"
              showLengthNotice={false}
              onChange={handlePasswordChange}
            />
          </Grid>
          <Grid item xs="auto">
            <Button
              primary
              disabled={password == null || passwordVerified}
              label="Verify"
              onClick={handleRawPkGlobalPasswordChange}
            />
          </Grid>
        </Grid>
      </FormRow>
    </>
  ) : (
    <>
      <FormRow>
        <FormLabel />
        <div>
          <Typography variant="h5">JSON Private Key</Typography>
          <Typography variant="subtitle1">Submit an Ethereum Private Key saved as a JSON file</Typography>
        </div>
      </FormRow>
      <FormRow>
        <FormLabel />
        {jsonPk && jsonAddress ? (
          <Box className={styles.dropBox}>
            <Typography variant="caption">JSON for address {jsonAddress} is set.</Typography>
            <Button label="Remove" variant="text" onClick={handleJsonPkRemove} />
          </Box>
        ) : (
          <Dropzone multiple={false} maxSize={1024 * 1024} onDrop={handleJsonPkDrop}>
            {({ getRootProps, getInputProps }) => (
              <div {...getRootProps()} className={styles.dropBox}>
                <input {...getInputProps()} />
                <Typography variant="caption">Drag&apos;n&apos;drop JSON file here, or click to select file</Typography>
              </div>
            )}
          </Dropzone>
        )}
      </FormRow>
      <FormRow>
        <FormLabel>Private Key Password</FormLabel>
        <PasswordInput onChange={handleJsonPkPasswordChange} />
      </FormRow>
      <FormRow last>
        <FormLabel>Global password</FormLabel>
        <Grid container alignItems="center" spacing={1}>
          <Grid item xs>
            <PasswordInput
              error={jsonPasswordError}
              minLength={1}
              placeholder="Enter existing password"
              showLengthNotice={false}
              onChange={handlePasswordChange}
            />
          </Grid>
          <Grid item xs="auto">
            <Button
              primary
              disabled={password == null || passwordVerified}
              label="Verify"
              onClick={handleJsonPkGlobalPasswordChange}
            />
          </Grid>
        </Grid>
      </FormRow>
    </>
  );
};

export default ImportPk;
