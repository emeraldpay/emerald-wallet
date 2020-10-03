import {connect} from "react-redux";
import {Dispatch} from "react";
import * as React from 'react';
import {Box, createStyles, Grid, Theme} from "@material-ui/core";
import {IState, transaction} from "@emeraldwallet/store";
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
const Component = (({tx, blockchain, seedId, onSign, sign}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  return <Grid container={true}>
    <Grid item={true} xs={12}>
      <TxSummary tx={tx} blockchain={blockchain}/>
    </Grid>
    <Grid item={true} xs={1}/>
    <Grid item={true} xs={11} className={styles.unlockRow}>
      <UnlockSeed seedId={seedId} onUnlock={(p) => {
        sign(p)
          .then((raw) => onSign(raw))
          .catch((e) => {
            console.error("Failed to sign", e);
          })
      }}/>
    </Grid>
  </Grid>
})

// State Properties
interface Props {
}

// Actions
interface Actions {
  sign: (password: string) => Promise<string>
}

// Component properties
interface OwnProps {
  tx: UnsignedBitcoinTx,
  entryId: Uuid,
  blockchain: BlockchainCode,
  seedId: Uuid,
  onSign: (raw: string) => void;
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {}
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {
      sign: (password: string) => {
        return new Promise((resolve, reject) => {
          dispatch(transaction.actions.signBitcoinTransaction(ownProps.entryId, ownProps.tx, password,
            (raw, err) => {
              if (raw) {
                resolve(raw)
              } else if (err) {
                reject(err)
              } else {
                reject("Unknown error")
              }
            }))
        });
      }
    }
  }
)((Component));