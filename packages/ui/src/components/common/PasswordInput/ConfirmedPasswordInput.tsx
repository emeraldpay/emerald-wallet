import {makeStyles, withStyles} from '@material-ui/core/styles';
import * as React from 'react';
import {Box, Button, createStyles, FormControl, Grid, Paper, TextField} from "@material-ui/core";
import PasswordInput from "./PasswordInput";


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
  minLength?: number
}

const defaults: Partial<OwnProps> = {
  buttonLabel: "Enter"
}

/**
 *
 */
const Component = ((props: OwnProps) => {
  props = {...props, ...defaults};
  const styles = useStyles();

  const [password, setPassword] = React.useState("");
  const [confirmation, setConfirmation] = React.useState("");

  return <Grid container={true}>
    <Grid xs>
      <PasswordInput onChange={setPassword} minLength={props.minLength}/>
    </Grid>
    <Grid xs>
      <TextField disabled={password == ""}
                 margin={"normal"}
                 fullWidth={true}
                 type={"password"}
                 placeholder={"Confirm password"}
                 onChange={(e) => setConfirmation(e.target.value)}/>
    </Grid>
    <Grid xs>
      <Button className={styles.button}
              disabled={password == "" || confirmation != password}
              variant={"contained"}
              onClick={() => props.onChange(password)}>{props.buttonLabel}</Button>
    </Grid>
  </Grid>
})

export default Component;