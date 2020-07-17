import {makeStyles} from '@material-ui/core/styles';
import * as React from 'react';
import {Box, createStyles, Grid, Typography, Divider, TextField, Button} from "@material-ui/core";
import {ConfirmedPasswordInput} from "../../index";
import Dropzone from 'react-dropzone';
import {Alert} from "@material-ui/lab";
import {useEffect} from "react";
import {WithDefaults} from "@emeraldwallet/core";


const useStyles = makeStyles(
  createStyles({
    divider: {
      margin: "20px 0 20px 0"
    },
    dropBox: {
      padding: "40px 0 40px 0",
      border: "1px solid #f0f0f0",
      textAlign: "center",
      margin: "10px 40px",
      backgroundColor: "#f0faff",
    }
  }),
);

// Component properties
interface OwnProps {
  classes?: any;
  onChange: (value: { raw: string, password: string } | string | undefined) => void;
}

const defaults: Partial<OwnProps> = {
  classes: {}
}

function isWeb3(json: any): boolean {
  return typeof json == "object"
    && typeof json.address == "string"
    && typeof json.crypto == "object";
}


/**
 *
 */
const Component = ((props: OwnProps) => {
  props = WithDefaults(props, defaults);
  const styles = useStyles();
  const {classes} = props;

  const [rawPk, setRawPk] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [json, setJson] = React.useState("");
  const [jsonAddress, setJsonAddress] = React.useState("");

  function setPk(value: string) {
    setRawPk(value);
    if (value.length > 0 && password.length > 0) {
      props.onChange({raw: value, password: password})
    } else {
      props.onChange(undefined);
    }
  }

  function setPkPassword(value: string) {
    setPassword(value);
    if (value.length > 0 && rawPk.length > 0) {
      props.onChange({raw: rawPk, password: value})
    } else {
      props.onChange(undefined);
    }
  }

  function onDrop(acceptedFiles: File[]) {
    const resolve = (json: string, web3: any) => {
      setJson(json);
      setJsonAddress(web3.address);
      if (json.length > 0) {
        props.onChange(json);
      } else {
        props.onChange(undefined);
      }
    }
    const reject = (err: string) => {
      console.warn("Failed to read JSON", err);
      setJson("");
      setJsonAddress("");
      props.onChange(undefined);
    }

    if (acceptedFiles.length == 0) {
      reject("File not selected");
    } else {
      const file = acceptedFiles[0];
      const reader = new FileReader()
      reader.onabort = () => {
        reject('file reading was aborted');
      }
      reader.onerror = () => {
        reject('file reading has failed');
      }
      reader.onload = () => {
        const result = reader.result
        if (typeof result == "string") {
          const web3 = JSON.parse(result);
          if (isWeb3(web3)) {
            resolve(result, web3);
          } else {
            reject("Not Web3 JSON")
          }
        } else {
          reject("Not a string " + typeof result);
        }
      }
      reader.readAsText(file);
    }
  }

  const rawPkDisabled = json && json.length > 0;
  const jsonDisabled = rawPk && rawPk.length > 0;

  let dropOrReset;
  if (json && jsonAddress) {
    dropOrReset = <Box className={styles.dropBox}>
      <Typography variant={"caption"}>JSON for address {jsonAddress} is set.</Typography>
      <Button variant={"text"} onClick={() => {
        setJsonAddress("");
        setJson("");
      }}>Remove</Button>
    </Box>
  } else {
    if (jsonDisabled) {
      dropOrReset = <Box className={styles.dropBox}>
        <Typography variant={"caption"}>Raw Private Key is entered. Remove Raw to upload JSON.</Typography>
      </Box>
    } else {
      dropOrReset = <Dropzone multiple={false} maxSize={1024 * 1024} onDrop={onDrop}>
        {({getRootProps, getInputProps}) => (
          <section>
            <div {...getRootProps()} className={styles.dropBox}>
              <input {...getInputProps()} />
              <Typography variant={"caption"}>Drag 'n' drop JSON file here, or click to select file</Typography>
            </div>
          </section>
        )}
      </Dropzone>
    }
  }

  return <Grid container={true}>
    <Grid item={true} xs={12}>
      <Typography variant={"h5"}>Raw Private Key</Typography>
      <Typography variant={"subtitle1"}>Submit an Ethereum Private Key formatted as Hex (66 character string starting
        with 0x)</Typography>
      <Grid container={true}>
        <Grid item={true} xs={3}>
          <Typography variant={"caption"}>Private Key</Typography>
        </Grid>
        <Grid item={true} xs={9}>
          <TextField placeholder={"0x..."}
                     disabled={rawPkDisabled}
                     fullWidth={true}
                     onChange={(e) => setPk(e.target.value)}/>
        </Grid>
        <Grid item={true} xs={3}>
          <Typography variant={"caption"}>Password</Typography>
        </Grid>
        <Grid item={true} xs={9}>
          <ConfirmedPasswordInput disabled={rawPkDisabled}
                                  onChange={setPkPassword}/>
        </Grid>
      </Grid>
    </Grid>
    <Grid item={true} xs={12}>
      <Divider variant={"middle"} className={styles.divider}/>
    </Grid>
    <Grid item={true} xs={12}>
      <Typography variant={"h5"}>JSON Private Key</Typography>
      <Typography variant={"subtitle1"}>Submit an Ethereum Private Key saved as a JSON file</Typography>
      {dropOrReset}
    </Grid>
  </Grid>
})

export default Component;