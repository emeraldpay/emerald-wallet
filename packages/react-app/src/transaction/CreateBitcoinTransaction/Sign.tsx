import {connect} from "react-redux";
import {Dispatch} from "react";
import * as React from 'react';
import {Box, createStyles, Grid, Theme, Typography} from "@material-ui/core";
import {accounts, hwkey, IState, transaction, screen} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import TxSummary from "./TxSummary";
import {BlockchainCode} from "@emeraldwallet/core";
import UnlockSeed from "../../create-account/UnlockSeed";
import {UnsignedBitcoinTx, Uuid} from "@emeraldpay/emerald-vault-core/lib/types";

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    unlockRow: {
      paddingTop: theme.spacing(2)
    },
  })
);

/**
 *
 */
const Component = (({tx, blockchain, seedId, isHardware, onSign, signHardware, sign}: Props & Actions & OwnProps) => {
  const styles = useStyles();

  let signComponent;
  if (isHardware) {
    signComponent = <Typography>
      Please connect and sign with your Ledger Nano X or Nano S.
    </Typography>
    React.useEffect(signHardware, [isHardware])
  } else {
    signComponent = <UnlockSeed seedId={seedId} onUnlock={sign}/>
  }

  return <Grid container={true}>
    <Grid item={true} xs={12}>
      <TxSummary tx={tx} blockchain={blockchain}/>
    </Grid>
    <Grid item={true} xs={1}/>
    <Grid item={true} xs={11} className={styles.unlockRow}>
      {signComponent}
    </Grid>
  </Grid>
})

// State Properties
interface Props {
  isHardware: boolean;
}

// Actions
interface Actions {
  sign: (password: string) => void;
  signHardware: () => void;
}

// Component properties
interface OwnProps {
  tx: UnsignedBitcoinTx;
  entryId: Uuid;
  blockchain: BlockchainCode;
  seedId: Uuid;
  onSign: (raw: string) => void;
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    const isHardware = accounts.selectors.isHardwareSeed(state, {type: "id", value: ownProps.seedId});
    return {
      isHardware
    }
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    const onSigned = (raw: string | undefined, err: string | undefined) => {
      if (raw) {
        ownProps.onSign(raw);
      } else if (err) {
        console.error(err)
      } else {
        console.error("Unknown error")
      }
      dispatch(screen.actions.closeDialog());
    };
    return {
      sign: (password: string) => {
        dispatch(
          transaction.actions.signBitcoinTransaction(
            ownProps.entryId, ownProps.tx, password,
            onSigned
          )
        )
      },
      signHardware: () => {
        dispatch(hwkey.actions.setWatch(true));
        dispatch(screen.actions.showDialog('sign-transaction', null));

        const connectHandler = (state: IState) => {
          if (hwkey.selectors.isBlockchainOpen(state, ownProps.blockchain)) {
            dispatch(hwkey.actions.setWatch(false));
            dispatch(
              transaction.actions.signBitcoinTransaction(
                ownProps.entryId, ownProps.tx, "none",
                onSigned
              )
            );
          } else {
            hwkey.triggers.onConnect(connectHandler);
          }
        };
        hwkey.triggers.onConnect(connectHandler);
      }
    }
  }
)((Component));