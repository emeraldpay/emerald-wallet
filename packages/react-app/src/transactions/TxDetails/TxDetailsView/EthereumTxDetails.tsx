import {connect} from "react-redux";
import {Dispatch} from "react";
import * as React from 'react';
import {Box, createStyles, Theme, Typography} from "@material-ui/core";
import {IState} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import {FormRow} from "@emeraldwallet/ui";
import {Account, Page} from "@emeraldplatform/ui";
import {EthereumStoredTransaction} from "@emeraldwallet/core";
import {ClassNameMap} from "@material-ui/core/styles/withStyles";
import {EntryId, Uuid} from "@emeraldpay/emerald-vault-core/lib/types";
import TxInputData from "./TxInputData";

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    // styleName: {
    //  ... css
    // },
  })
);


/**
 *
 */
const Component = (({transaction, classes, openAccount, fromWallet, toWallet}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  return <>
    <FormRow
      leftColumn={<div className={classes?.fieldName}>Nonce</div>}
      rightColumn={
        <Typography>{transaction.nonce}</Typography>
      }
    />

    <FormRow
      leftColumn={<div className={classes?.fieldName}>From</div>}
      rightColumn={(
        <Account
          address={transaction.from}
          identity={true}
          identityProps={{size: 30}}
          onClick={() => fromWallet ? openAccount?.call(openAccount, fromWallet) : null}
        />
      )}
    />

    <FormRow
      leftColumn={<div className={classes?.fieldName}>To</div>}
      rightColumn={
        transaction.to ? (
          <Account
            data-testid={'to-account'}
            address={transaction.to}
            identity={true}
            identityProps={{size: 30}}
            onClick={() => toWallet ? openAccount?.call(openAccount, toWallet) : null}
          />
        ) : <div/>
      }
    />

    <FormRow
      leftColumn={<div className={classes?.fieldName}>Input Data</div>}
      rightColumn={(
        <div className={classes?.txData}>
          <TxInputData data={transaction.data}/>
        </div>
      )}
    />

    <FormRow
      leftColumn={<div className={classes?.fieldName}>GAS</div>}
      rightColumn={
        <Typography>{transaction.gas}</Typography>
      }
    />

  </>
})

// State Properties
interface Props {
}

// Actions
interface Actions {
}

// Component properties
interface OwnProps {
  transaction: EthereumStoredTransaction;
  classes?: Partial<ClassNameMap<ClassKey>>;
  openAccount?: (walletId: Uuid) => void;
  fromWallet?: Uuid;
  toWallet?: Uuid;
}

type ClassKey = 'fieldName' | 'txData';

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {}
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {}
  }
)((Component));