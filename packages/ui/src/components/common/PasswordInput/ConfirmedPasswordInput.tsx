import {makeStyles, withStyles} from '@material-ui/core/styles';
import * as React from 'react';
import {Box, Button, createStyles, FormControl, Grid, Paper, TextField, Typography} from "@material-ui/core";
import PasswordInput from "./PasswordInput";
import {WithDefaults} from "@emeraldwallet/core";


const useStyles = makeStyles(
  createStyles({
    button: {
      margin: "20px 0 0 10px"
    },
  })
);

// Component properties
interface OwnProps {
  onChange: (value: string) => void;
  buttonLabel?: string;
  minLength?: number;
  helperText?: string;
  disabled?: boolean
}

const defaults: Partial<OwnProps> = {
  buttonLabel: "Enter",
}

/**
 *
 */
const Component = ((props: OwnProps) => {
  props = WithDefaults(props, defaults);
  const styles = useStyles();
  const disabled = props.disabled || false;

  const [password, setPassword] = React.useState("");
  const [confirmation, setConfirmation] = React.useState("");

  return <Grid container={true}>
    <Grid item={true} xs={4}>
      <PasswordInput onChange={setPassword}
                     disabled={disabled}
                     minLength={props.minLength}/>
    </Grid>
    <Grid item={true} xs={4}>
      <TextField disabled={password == "" || disabled}
                 margin={"normal"}
                 fullWidth={true}
                 type={"password"}
                 placeholder={"Confirm password"}
                 onChange={(e) => setConfirmation(e.target.value)}/>
    </Grid>
    <Grid item={true} xs={4}>
      <Button className={styles.button}
              disabled={disabled || password == "" || confirmation != password}
              variant={"contained"}
              onClick={() => props.onChange(password)}>{props.buttonLabel}</Button>
    </Grid>
    {props.helperText &&
    <Grid xs={8}>
      <Typography variant={"body2"}>{props.helperText}</Typography>
    </Grid>
    }
  </Grid>
})

export default Component;