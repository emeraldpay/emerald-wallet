import {connect} from "react-redux";
import {IState} from "@emeraldwallet/store";
import {Dispatch} from "react";
import * as React from 'react';
import {TextField} from "@material-ui/core";
import {TWalletOptions} from "./flow/types";

type Props = {}
type Actions = {}

/**
 * Set common wallet options, such as label.
 */
const Component = (({onChange}: Props & Actions & OwnProps) => {
  const [current, setCurrent] = React.useState({label: ""} as TWalletOptions)

  return <form noValidate autoComplete="off">
    <TextField id="label"
               fullWidth={true}
               label="Label"
               helperText="(optional) Wallet Label"
               value={current.label}
               onChange={(event) => {
                 const value = event.target.value;
                 const updated = Object.assign({}, current, {label: value});
                 setCurrent(updated);
                 onChange(updated);
               }}
    />
  </form>
})

type OwnProps = {
  onChange: (value: TWalletOptions) => void
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {}
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {}
  }
)((Component));