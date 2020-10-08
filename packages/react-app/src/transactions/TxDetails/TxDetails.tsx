import {connect} from "react-redux";
import {Dispatch} from "react";
import * as React from 'react';
import {Box, createStyles, Theme, Typography} from "@material-ui/core";
import {IState} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import {accounts, screen, settings, txhistory} from '@emeraldwallet/store';
import {Wallet, EntryId, WalletEntry} from "@emeraldpay/emerald-vault-core";
import {
  amountFactory,
  blockchainByName,
  isBitcoinStoredTransaction,
  isEthereumStoredTransaction,
  IStoredTransaction
} from "@emeraldwallet/core";
import EthereumTxDetails from "./TxDetailsView/EthereumTxDetails";
import {ButtonGroup, Page} from "@emeraldplatform/ui";
import {Back} from "@emeraldplatform/ui-icons";
import {Button, FormRow} from "@emeraldwallet/ui";
import {parseDate} from "@emeraldwallet/core/lib/utils";
import TxStatus from "./TxDetailsView/TxStatus";
import {convert} from "@emeraldplatform/core";
import {ITokenInfo, registry} from "@emeraldwallet/erc20";
import {Uuid} from "@emeraldpay/emerald-vault-core/lib/types";
import {EntryIdOp} from "@emeraldpay/emerald-vault-core/lib/ops";
import BitcoinTxDetails from "./TxDetailsView/BitcoinTxDetails";

const {gotoScreen} = screen.actions;

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    value: {
      marginBottom: '5px',
      marginRight: '5px'
    },
    txData: {
      overflowX: 'auto',
      overflowWrap: 'break-word'
    },
    fieldName: {
      color: '#747474',
      fontSize: '16px',
      textAlign: 'right'
    },
    formRow: {
      display: 'flex',
      marginBottom: '19px',
      alignItems: 'center'
    },
    left: {
      flexBasis: '20%',
      marginLeft: '14.75px',
      marginRight: '14.75px'
    },
    right: {
      flexGrow: 2,
      display: 'flex',
      alignItems: 'center',
      marginLeft: '14.75px',
      marginRight: '14.75px',
      maxWidth: '580px'
    }
  })
);

/**
 *
 */
const Component = ((props: Props & Actions & OwnProps) => {
  const styles = useStyles();
  const {
    transaction, fiatCurrency, fiatAmount, goBack, fromWallet, toWallet
  } = props;

  function handleBack() {
    if (goBack) {
      goBack(props.account);
    }
  }

  function handleReceiptClick() {
    if (props.openReceipt) {
      props.openReceipt();
    }
  }

  function handleCancelClick() {
    if (props.cancel) {
      props.cancel();
    }
  }

  const blockNumber = transaction.blockNumber;
  const txStatus = blockNumber ? 'success' : (transaction.discarded ? 'discarded' : 'queue');
  const date = transaction.timestamp ?
    transaction.timestamp :
    (transaction.since ? transaction.since : undefined);

  let chainDetails: React.ReactElement | undefined = undefined;
  let value: React.ReactElement | undefined = undefined;
  if (isEthereumStoredTransaction(transaction)) {
    chainDetails = <EthereumTxDetails
      transaction={transaction}
      classes={{fieldName: styles.fieldName, txData: styles.txData}}
      fromWallet={fromWallet}
      toWallet={toWallet}
      openAccount={(acc) => props.openAccount?.call(props.openAccount, acc)}
    />

    value = <FormRow
      leftColumn={<div className={styles.fieldName}>Value</div>}
      rightColumn={<div style={{display: 'flex'}}>
        <div className={styles.value}>
          {transaction.value ? amountFactory(transaction.blockchain)(transaction.value).toString() : '--'}
        </div>
        {fiatAmount && (
          <div className={styles.value}>
            {fiatAmount} {fiatCurrency}
          </div>
        )}
      </div>}
    />

  } else if (isBitcoinStoredTransaction(transaction)) {
    value = <BitcoinTxDetails transaction={transaction}
                              classes={{fieldName: styles.fieldName, txData: styles.txData}}/>;
  }

  return (
    <Page title='Transaction Details' leftIcon={<Back onClick={handleBack}/>}>
      <FormRow
        leftColumn={<div className={styles.fieldName}>Date</div>}
        rightColumn={(
          <div title={date ? parseDate(date)?.toUTCString() : 'pending'}>
            {date ? date.toString() : 'pending'}
          </div>
        )}
      />

      <FormRow
        leftColumn={<div className={styles.fieldName}>Status</div>}
        rightColumn={<TxStatus status={txStatus}/>}
      />

      {value}

      <br/>
      <br/>

      <FormRow
        leftColumn={<div className={styles.fieldName}>Hash</div>}
        rightColumn={
          <Typography>{transaction.hash}</Typography>
        }
      />
      <FormRow
        leftColumn={<div className={styles.fieldName}>Block</div>}
        rightColumn={<React.Fragment>{blockNumber ? convert.toNumber(blockNumber) : 'pending'}</React.Fragment>}
      />

      {chainDetails}

      <FormRow
        rightColumn={(
          <ButtonGroup>
            <Button onClick={handleCancelClick} label='DASHBOARD'/>
            <Button onClick={handleReceiptClick} primary={true} label='OPEN RECEIPT'/>
          </ButtonGroup>
        )}
      />
    </Page>
  );
})

// State Properties
interface Props {
  fiatAmount?: string;
  fiatCurrency?: string;
  fromWallet?: Uuid;
  toWallet?: Uuid;
  rates?: Map<string, number>;
  transaction: IStoredTransaction;
  account?: any;
}

// Actions
interface Actions {
  cancel: () => void;
  goBack: (walletId: Uuid) => void;
  openAccount: (walletId?: Uuid) => void;
  openReceipt: () => void;
}

// Component properties
interface OwnProps {
  hash: string;
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    const tx = txhistory.selectors.selectByHash(state, ownProps.hash);
    if (!tx) {
      throw new Error("Unknown tx: " + ownProps.hash);
    }
    const blockchain = blockchainByName(tx.blockchain);
    let toAccount: WalletEntry | undefined = undefined;
    let fromAccount: WalletEntry | undefined = undefined;
    let token: ITokenInfo | null = null;
    if (isEthereumStoredTransaction(tx)) {
      toAccount = accounts.selectors.findAccountByAddress(state, tx.to || "", blockchain!.params.code) || undefined;
      fromAccount = accounts.selectors.findAccountByAddress(state, tx.from, blockchain!.params.code) || undefined;
      token = registry.byAddress(blockchain!.params.code, tx.to || "");
    } else if (isBitcoinStoredTransaction(tx)) {

    }
    return {
      fromWallet: fromAccount ? EntryIdOp.of(fromAccount.id).extractWalletId() : undefined,
      toWallet: toAccount ? EntryIdOp.of(toAccount.id).extractWalletId() : undefined,
      transaction: tx,
    }
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {
      cancel: () => {
        dispatch(gotoScreen(screen.Pages.HOME));
      },
      goBack: (wallet: Uuid) => {
        if (wallet) {
          dispatch(gotoScreen(screen.Pages.WALLET, wallet));
        } else {
          dispatch(gotoScreen(screen.Pages.HOME));
        }
      },
      openAccount: (wallet?: Uuid) => {
        if (wallet) {
          dispatch(gotoScreen(screen.Pages.WALLET, wallet));
        }
      },
      openReceipt: () => {
        dispatch(screen.actions.openTxReceipt(ownProps.hash));
      },
    }
  }
)((Component));
