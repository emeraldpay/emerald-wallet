import {connect} from "react-redux";
import {Dispatch} from "react";
import * as React from 'react';
import {Box, createStyles, Theme, TextField} from "@material-ui/core";
import {IState} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import FormLabel from "../CreateTx/FormLabel/FormLabel";
import {ButtonGroup} from "@emeraldplatform/ui";
import {Button} from "@emeraldwallet/ui";
import FormFieldWrapper from "../CreateTx/FormFieldWrapper";

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    fieldRoot: {
      border: 0
    },
    value: {
      fontSize: "12px",
      ...theme.monotype
    }
  })
);

/**
 *
 */
const Component = (({rawtx}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  return <Box>
    <TextField
      classes={{root: styles.fieldRoot}}
      label="Raw Tx"
      value={rawtx}
      multiline={true}
      rows={4}
      fullWidth
      InputLabelProps={{
        shrink: true,
      }}
      InputProps={{
        classes: {
          input: styles.value
        }
      }}
      variant="outlined"
    />
  </Box>
})

// State Properties
interface Props {
}

// Actions
interface Actions {
}

// Component properties
interface OwnProps {
  rawtx: string
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {}
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {}
  }
)((Component));