import {connect} from "react-redux";
import {Dispatch} from "react";
import * as React from 'react';
import {Box, createStyles, Grid, Theme} from "@material-ui/core";
import {IState} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import RawTxDetails from "./RawTxDetails";
import RawTx from "./RawTx";
import {ButtonGroup} from "@emeraldplatform/ui";
import {Button} from "@emeraldwallet/ui";

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    buttonsRow: {
      paddingLeft: theme.spacing(),
      paddingTop: theme.spacing(2)
    },
  })
);

/**
 *
 */
const Component = (({rawtx, onConfirm}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  return <Grid container={true}>
    <Grid item={true} xs={12}>
      <RawTxDetails rawtx={rawtx}/>
    </Grid>
    <Grid item={true} xs={12}>
      <RawTx rawtx={rawtx}/>
    </Grid>
    <Grid item={true} xs={12} className={styles.buttonsRow}>
      <ButtonGroup>
        <Button label={'Cancel'}/>
        <Button label={'Send'} primary={true} onClick={() => onConfirm()}/>
      </ButtonGroup>
    </Grid>
  </Grid>
})

// State Properties
interface Props {
}

// Actions
interface Actions {
}

// Component properties
interface OwnProps {
  rawtx: string,
  onConfirm: () => void
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {}
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {}
  }
)((Component));