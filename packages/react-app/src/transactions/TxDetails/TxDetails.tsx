import { WalletEntry } from '@emeraldpay/emerald-vault-core';
import { EntryIdOp } from '@emeraldpay/emerald-vault-core/lib/ops';
import { Uuid } from '@emeraldpay/emerald-vault-core/lib/types';
import {
  amountFactory,
  blockchainByName,
  isBitcoinStoredTransaction,
  isEthereumStoredTransaction,
  IStoredTransaction,
  toNumber,
} from '@emeraldwallet/core';
import { parseDate } from '@emeraldwallet/core/lib/utils';
import { accounts, IState, screen, txhistory } from '@emeraldwallet/store';
import { Back, Button, ButtonGroup, FormRow, Page } from '@emeraldwallet/ui';
import { createStyles, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { Dispatch } from 'react';
import { connect } from 'react-redux';
import BitcoinTxDetails from './TxDetailsView/BitcoinTxDetails';
import EthereumTxDetails from './TxDetailsView/EthereumTxDetails';
import TxStatus from './TxDetailsView/TxStatus';

const { gotoScreen, gotoWalletsScreen } = screen.actions;

const useStyles = makeStyles(
  createStyles({
    value: {
      marginBottom: '5px',
      marginRight: '5px',
    },
    txData: {
      overflowX: 'auto',
      overflowWrap: 'break-word',
    },
    fieldName: {
      color: '#747474',
      fontSize: '16px',
      textAlign: 'right',
    },
    formRow: {
      display: 'flex',
      marginBottom: '19px',
      alignItems: 'center',
    },
    left: {
      flexBasis: '20%',
      marginLeft: '14.75px',
      marginRight: '14.75px',
    },
    right: {
      flexGrow: 2,
      display: 'flex',
      alignItems: 'center',
      marginLeft: '14.75px',
      marginRight: '14.75px',
      maxWidth: '580px',
    },
  }),
);

/**
 *
 */
const Component: React.FC<Props & Actions & OwnProps> = ({
  account,
  fiatAmount,
  fiatCurrency,
  fromWallet,
  toWallet,
  transaction,
  goBack,
  goCancelTx,
  goSpeedUpTx,
  goToDashboard,
  openAccount,
  openReceipt,
}) => {
  const styles = useStyles();

  function handleBack(): void {
    if (goBack) {
      goBack(account);
    }
  }

  function handleDashboardClick(): void {
    if (goToDashboard) {
      goToDashboard();
    }
  }

  function handleCancelClick(): void {
    if (goCancelTx) {
      goCancelTx(transaction);
    }
  }

  function handleSpeedUpClick(): void {
    if (goSpeedUpTx) {
      goSpeedUpTx(transaction);
    }
  }

  function handleReceiptClick(): void {
    if (openReceipt) {
      openReceipt();
    }
  }

  const { blockNumber, totalRetries, since } = transaction;
  const txSince = typeof since === 'string' ? new Date(since) : since ?? new Date(0);
  const notExecuted = totalRetries === 10 || txSince.getTime() < new Date().getTime() - 7 * 24 * 60 * 60 * 1000;

  const txStatus = blockNumber
    ? 'success'
    : transaction.discarded
    ? 'discarded'
    : notExecuted
    ? 'not-executed'
    : 'queue';

  const date = transaction.timestamp ? transaction.timestamp : since ? since : undefined;

  let chainDetails: React.ReactElement | undefined = undefined;
  let value: React.ReactElement | undefined = undefined;
  if (isEthereumStoredTransaction(transaction)) {
    chainDetails = (
      <EthereumTxDetails
        transaction={transaction}
        classes={{ fieldName: styles.fieldName, txData: styles.txData }}
        fromWallet={fromWallet}
        toWallet={toWallet}
        openAccount={(acc) => openAccount?.call(openAccount, acc)}
      />
    );

    value = (
      <FormRow
        leftColumn={<div className={styles.fieldName}>Value</div>}
        rightColumn={
          <div style={{ display: 'flex' }}>
            <div className={styles.value}>
              {transaction.value ? amountFactory(transaction.blockchain)(transaction.value).toString() : '--'}
            </div>
            {fiatAmount && (
              <div className={styles.value}>
                {fiatAmount} {fiatCurrency}
              </div>
            )}
          </div>
        }
      />
    );
  } else if (isBitcoinStoredTransaction(transaction)) {
    value = (
      <BitcoinTxDetails transaction={transaction} classes={{ fieldName: styles.fieldName, txData: styles.txData }} />
    );
  }

  return (
    <Page title="Transaction Details" leftIcon={<Back onClick={handleBack} />}>
      <FormRow
        leftColumn={<div className={styles.fieldName}>Date</div>}
        rightColumn={
          <div title={date ? parseDate(date)?.toUTCString() : 'pending'}>{date ? date.toString() : 'pending'}</div>
        }
      />
      <FormRow
        leftColumn={<div className={styles.fieldName}>Status</div>}
        rightColumn={<TxStatus status={txStatus} />}
      />
      {value}
      <br />
      <br />
      <FormRow
        leftColumn={<div className={styles.fieldName}>Hash</div>}
        rightColumn={<Typography>{transaction.hash}</Typography>}
      />
      <FormRow
        leftColumn={<div className={styles.fieldName}>Block</div>}
        rightColumn={<React.Fragment>{blockNumber ? toNumber(blockNumber) : 'pending'}</React.Fragment>}
      />
      {chainDetails}
      {isEthereumStoredTransaction(transaction) && txStatus === 'queue' && (
        <FormRow
          leftColumn={<div className={styles.fieldName}>Modify</div>}
          rightColumn={
            <ButtonGroup>
              <Button onClick={handleSpeedUpClick} label="SPEED UP" />
              <Button onClick={handleCancelClick} label="CANCEL TRANSACTION" />
            </ButtonGroup>
          }
        />
      )}
      <FormRow
        rightColumn={
          <ButtonGroup>
            <Button onClick={handleDashboardClick} label="DASHBOARD" />
            <Button onClick={handleReceiptClick} primary={true} label="OPEN RECEIPT" />
          </ButtonGroup>
        }
      />
    </Page>
  );
};

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
  goBack(walletId: Uuid): void;
  goCancelTx(tx: IStoredTransaction): void;
  goToDashboard(): void;
  goSpeedUpTx(tx: IStoredTransaction): void;
  openAccount(walletId?: Uuid): void;
  openReceipt(): void;
}

// Component properties
interface OwnProps {
  hash: string;
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    const tx = txhistory.selectors.selectByHash(state, ownProps.hash);

    if (!tx) {
      throw new Error('Unknown tx: ' + ownProps.hash);
    }

    const blockchain = blockchainByName(tx.blockchain);

    let toAccount: WalletEntry | undefined = undefined;
    let fromAccount: WalletEntry | undefined = undefined;

    if (isEthereumStoredTransaction(tx)) {
      toAccount = accounts.selectors.findAccountByAddress(state, tx.to || '', blockchain.params.code) || undefined;
      fromAccount = accounts.selectors.findAccountByAddress(state, tx.from, blockchain.params.code) || undefined;
    }

    return {
      fromWallet: fromAccount ? EntryIdOp.of(fromAccount.id).extractWalletId() : undefined,
      toWallet: toAccount ? EntryIdOp.of(toAccount.id).extractWalletId() : undefined,
      transaction: tx,
    };
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {
      goCancelTx(tx: IStoredTransaction) {
        dispatch(gotoScreen(screen.Pages.CREATE_TX_CANCEL, tx));
      },
      goBack(wallet: Uuid) {
        if (wallet) {
          dispatch(gotoScreen(screen.Pages.WALLET, wallet));
        } else {
          dispatch(gotoScreen(screen.Pages.HOME));
        }
      },
      goSpeedUpTx(tx: IStoredTransaction) {
        dispatch(gotoScreen(screen.Pages.CREATE_TX_SPEED_UP, tx));
      },
      goToDashboard() {
        dispatch(gotoWalletsScreen());
      },
      openAccount(wallet?: Uuid) {
        if (wallet) {
          dispatch(gotoScreen(screen.Pages.WALLET, wallet));
        }
      },
      openReceipt() {
        dispatch(screen.actions.openTxReceipt(ownProps.hash));
      },
    };
  },
)(Component);
