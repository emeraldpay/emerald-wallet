import { Box, Button, createStyles, Grid, TextField, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import Dropzone from 'react-dropzone';
import { PasswordInput } from '../../index';

const useStyles = makeStyles(
  createStyles({
    divider: {
      margin: '20px 0 20px 0',
    },
    dropBox: {
      padding: '40px 0 40px 0',
      border: '1px solid #f0f0f0',
      textAlign: 'center',
      margin: '10px 40px',
      backgroundColor: '#f0faff',
    },
  }),
);

export type ImportPkType = { password: string; json?: string; jsonPassword?: string; raw?: string };

interface OwnProps {
  classes?: any;
  raw: boolean;
  onChange: (value: ImportPkType) => void;
}

function isWeb3(json: any): boolean {
  return typeof json == 'object'
    && typeof json.address == 'string'
    && typeof json.crypto == 'object';
}

const Component: React.FC<OwnProps> = (props) => {
  const styles = useStyles();

  const [json, setJson] = React.useState('');
  const [jsonAddress, setJsonAddress] = React.useState('');
  const [jsonPassword, setJsonPassword] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [rawPk, setRawPk] = React.useState('');

  function setPk(value: string): void {
    setRawPk(value);

    if (value.length > 0) {
      props.onChange({ password, raw: value });
    }
  }

  function setPkGlobalPassword(value: string): void {
    setPassword(value);

    if (value.length > 0) {
      props.onChange({ raw: rawPk, password: value });
    }
  }

  function onJsonDrop(acceptedFiles: File[]): void {
    const resolve = (json: string, web3: any): void => {
      setJson(json);
      setJsonAddress(web3.address);

      if (json.length > 0) {
        props.onChange({ json, jsonPassword, password });
      }
    }

    const reject = (err: string): void => {
      console.warn('Failed to read JSON', err);

      setJson('');
      setJsonAddress('');
    }

    if (acceptedFiles.length == 0) {
      reject('File not selected');
    } else {
      const file = acceptedFiles[0];
      const reader = new FileReader();

      reader.onabort = () => {
        reject('file reading was aborted');
      }

      reader.onerror = () => {
        reject('file reading has failed');
      }

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
      }

      reader.readAsText(file);
    }
  }

  function setJsonGlobalPassword(value: string): void {
    setPassword(value);

    if (value.length > 0) {
      props.onChange({ json, jsonPassword, password: value });
    }
  }

  function setJsonFilePassword(value: string): void {
    setJsonPassword(value);

    if (value.length > 0) {
      props.onChange({ json, password, jsonPassword: value });
    }
  }

  return <Grid container={true}>
    {props.raw ? (
      <Grid item={true} xs={12}>
        <Typography variant="h5">Raw Private Key</Typography>
        <Typography variant="subtitle1">
          Submit an Ethereum Private Key formatted as Hex (66 character string starting with 0x)
        </Typography>
        <Grid container={true}>
          <Grid item={true} xs={3}>
            <Typography variant="caption">Private Key</Typography>
          </Grid>
          <Grid item={true} xs={9}>
            <TextField
              placeholder="0x..."
              fullWidth={true}
              onChange={(e) => setPk(e.target.value)}
            />
          </Grid>
          <Grid item={true} xs={3}>
            <Typography variant="caption">Global password</Typography>
          </Grid>
          <Grid item={true} xs={9}>
            <PasswordInput onChange={setPkGlobalPassword} />
          </Grid>
        </Grid>
      </Grid>
    ) : (
      <Grid item={true} xs={12}>
        <Typography variant="h5">JSON Private Key</Typography>
        <Typography variant="subtitle1">Submit an Ethereum Private Key saved as a JSON file</Typography>
        {json && jsonAddress ? (
          <Box className={styles.dropBox}>
            <Typography variant="caption">JSON for address {jsonAddress} is set.</Typography>
            <Button
              variant="text"
              onClick={() => {
                setJson('');
                setJsonAddress('');
              }}
            >
              Remove
            </Button>
          </Box>
        ) : (
          <Dropzone multiple={false} maxSize={1024 * 1024} onDrop={onJsonDrop}>
            {({ getRootProps, getInputProps }) => (
              <section>
                <div {...getRootProps()} className={styles.dropBox}>
                  <input {...getInputProps()} />
                  <Typography variant="caption">Drag&apos;n&apos;drop JSON file here, or click to select
                    file</Typography>
                </div>
              </section>
            )}
          </Dropzone>
        )}
        <Grid container={true}>
          <Grid item={true} xs={3}>
            <Typography variant="caption">Global password</Typography>
          </Grid>
          <Grid item={true} xs={9}>
            <PasswordInput onChange={setJsonGlobalPassword} />
          </Grid>
          <Grid item={true} xs={3}>
            <Typography variant="caption">Private Key Password</Typography>
          </Grid>
          <Grid item={true} xs={9}>
            <PasswordInput onChange={setJsonFilePassword} />
          </Grid>
        </Grid>
      </Grid>
    )}
  </Grid>
};

export default Component;
