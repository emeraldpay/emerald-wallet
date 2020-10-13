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
import {EntryId} from "@emeraldpay/emerald-vault-core/lib/types";
import {BlockchainCode} from "@emeraldwallet/core";

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
const Component = (({rawtx, entryId, blockchain, onConfirm}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  const [showRaw, setShowRaw] = React.useState(false);

  let raw = null;
  if (showRaw) {
    raw = <Box>
      <RawTx rawtx={rawtx}/>
      <Button variant={"text"} onClick={() => setShowRaw(false)} label={"Hide Raw"}/>
    </Box>
  } else {
    raw = <Button variant={"text"} onClick={() => setShowRaw(true)} label={"Show Raw"}/>
  }

  return <Grid container={true}>
    <Grid item={true} xs={12}>
      <RawTxDetails rawtx={rawtx} entryId={entryId} blockchain={blockchain}/>
    </Grid>
    <Grid item={true} xs={12}>
      {raw}
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
  entryId: EntryId,
  blockchain: BlockchainCode,
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