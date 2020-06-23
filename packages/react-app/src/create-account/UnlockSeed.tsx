import {connect} from "react-redux";
import {Dispatch} from "react";
import * as React from 'react';
import {Box, createStyles, TextField} from "@material-ui/core";
import {IState} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import {Button, PasswordInput} from "@emeraldwallet/ui";

const useStyles = makeStyles(
  createStyles({
    // styleName: {
    //  ... css
    // },
  })
);

/**
 *
 */
const Component = (({onUnlock}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  const [password, setPassword] = React.useState();
  return <form noValidate autoComplete="off">
    <PasswordInput
      password={password}
      onChange={setPassword}
    />
    <Button
      label={'Unlock'}
      primary={true}
      onClick={() => onUnlock(password)}
    />
  </form>
})

// State Properties
type Props = {}
// Actions
type Actions = {}

// Component properties
type OwnProps = {
  onUnlock: (password: string) => void;
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {}
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {}
  }
)((Component));