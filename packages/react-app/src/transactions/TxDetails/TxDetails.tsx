import { Wei } from '@emeraldpay/bigamount-crypto';
import { Uuid } from '@emeraldpay/emerald-vault-core';
import {
  EthereumReceipt,
  EthereumTransaction,
  PersistentState,
  blockchainById,
  blockchainIdToCode,
  formatAmount,
  isEthereum,
} from '@emeraldwallet/core';
import { StoredTransaction, screen, transaction } from '@emeraldwallet/store';
import { Address, Back, Balance, Button, ButtonGroup, FormRow, Page } from '@emeraldwallet/ui';
import { Typography, createStyles } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import { connect } from 'react-redux';
import { TxStatus } from './TxStatus';

const { Direction, State, Status } = PersistentState;
const { gotoScreen, gotoWalletsScreen } = screen.actions;

const styles = createStyles({
  idField: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  nameField: {
    color: '#747474',
    fontSize: '16px',
    textAlign: 'right',
  },
  textField: {
    width: '100%',
  },
});

interface OwnProps {
  tx?: StoredTransaction;
}

interface DispatchProps {
  getEthReceipt(tx: StoredTransaction): Promise<EthereumReceipt | null>;
  getEthTx(tx: StoredTransaction): Promise<EthereumTransaction | null>;
  goBack(walletId?: Uuid): void;
  goToCancelTx(tx: EthereumTransaction): void;
  goToDashboard(): void;
  goToReceipt(tx: StoredTransaction): void;
  goToSpeedUpTx(tx: EthereumTransaction): void;
}

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

const TxDetails: React.FC<OwnProps & DispatchProps & StylesProps> = ({
  classes,
  tx,
  getEthTx,
  getEthReceipt,
  goBack,
  goToCancelTx,
  goToDashboard,
  goToReceipt,
  goToSpeedUpTx,
}) => {
  const [ethReceipt, setEthReceipt] = React.useState<EthereumReceipt | null>(null);
  const [ethTx, setEthTx] = React.useState<EthereumTransaction | null>(null);

  const blockchain = React.useMemo(() => (tx == null ? undefined : blockchainById(tx.blockchain)), [tx]);
  const txChanges = React.useMemo(() => tx?.changes.filter((change) => change.amountValue.isPositive()) ?? [], [tx]);
  const txStatus = React.useMemo(
    () => (ethReceipt == null ? tx?.status : ethReceipt.status === 1 ? Status.OK : Status.FAILED),
    [ethReceipt, tx],
  );

  React.useEffect(() => {
    if (tx != null && blockchain != null && isEthereum(blockchain.params.code)) {
      (async () => {
        const results = await Promise.allSettled([getEthReceipt(tx), getEthTx(tx)]);

        const [receipt, transaction] = results.map((result) =>
          result.status === 'fulfilled' ? result.value : null,
        ) as [EthereumReceipt, EthereumTransaction];

        setEthReceipt(receipt);
        setEthTx(transaction);
      })();
    }
  }, [blockchain, tx, getEthReceipt, getEthTx]);

  return (
    <Page title="Transaction Details" leftIcon={<Back onClick={() => goBack()} />}>
      {tx != null && (
        <>
          <FormRow
            leftColumn={<div className={classes.nameField}>Date</div>}
            rightColumn={<Typography>{tx.confirmTimestamp?.toUTCString() ?? 'Pending'}</Typography>}
          />
          <FormRow
            leftColumn={<div className={classes.nameField}>Status</div>}
            rightColumn={<TxStatus state={tx.state} status={txStatus} />}
          />
          <FormRow
            leftColumn={<div className={classes.nameField}>Hash</div>}
            rightColumn={
              <Typography className={classes.idField} title={tx.txId}>
                {tx.txId}
              </Typography>
            }
          />
          <FormRow
            leftColumn={<div className={classes.nameField}>Block</div>}
            rightColumn={<Typography>{tx.block?.height ?? 'Pending'}</Typography>}
          />
          {txChanges.length > 0 && (
            <>
              <br />
              {txChanges.map((change, index) => (
                <div key={`${change.address}-${index}`}>
                  <FormRow
                    leftColumn={
                      <div className={classes.nameField}>{change.direction === Direction.EARN ? 'To' : 'From'}</div>
                    }
                    rightColumn={
                      <>
                        <Address address={change.address ?? 'Unknown address'} disableCopy={change.address == null} />
                        <Balance balance={change.amountValue} />
                      </>
                    }
                  />
                </div>
              ))}
            </>
          )}
          {ethTx != null && (
            <>
              <br />
              {ethReceipt?.effectiveGasPrice != null && (
                <FormRow
                  leftColumn={<div className={classes.nameField}>Transaction Fee</div>}
                  rightColumn={
                    <Typography>
                      {formatAmount(
                        new Wei(new BigNumber(ethReceipt.effectiveGasPrice).multipliedBy(ethReceipt.gasUsed)),
                      )}
                    </Typography>
                  }
                />
              )}
              {ethTx.gasPrice == null ? (
                <>
                  <FormRow
                    leftColumn={<div className={classes.nameField}>Max Gas Price</div>}
                    rightColumn={<Typography>{formatAmount(new Wei(ethTx.maxGasPrice ?? 0))}</Typography>}
                  />
                  <FormRow
                    leftColumn={<div className={classes.nameField}>Priority Gas Price</div>}
                    rightColumn={<Typography>{formatAmount(new Wei(ethTx.priorityGasPrice ?? 0))}</Typography>}
                  />
                </>
              ) : (
                <FormRow
                  leftColumn={<div className={classes.nameField}>Gas Price</div>}
                  rightColumn={<Typography>{formatAmount(new Wei(ethTx.gasPrice))}</Typography>}
                />
              )}
              <FormRow
                leftColumn={<div className={classes.nameField}>Nonce</div>}
                rightColumn={<Typography>{ethTx.nonce}</Typography>}
              />
              <FormRow
                leftColumn={<div className={classes.nameField}>Input Data</div>}
                rightColumn={<textarea className={classes.textField} readOnly={true} rows={5} value={ethTx.data} />}
              />
              {tx.state < State.CONFIRMED && (
                <FormRow
                  leftColumn={<div className={classes.nameField}>Modify</div>}
                  rightColumn={
                    <ButtonGroup>
                      <Button onClick={() => goToSpeedUpTx(ethTx)} label="SPEED UP" />
                      <Button onClick={() => goToCancelTx(ethTx)} label="CANCEL TRANSACTION" />
                    </ButtonGroup>
                  }
                />
              )}
            </>
          )}
          <FormRow
            rightColumn={
              <ButtonGroup>
                <Button onClick={goToDashboard} label="DASHBOARD" />
                <Button onClick={() => goToReceipt(tx)} primary={true} label="OPEN RECEIPT" />
              </ButtonGroup>
            }
          />
        </>
      )}
    </Page>
  );
};

export default connect<{}, DispatchProps>(
  null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    getEthReceipt(tx) {
      return dispatch(transaction.actions.getEthReceipt(blockchainIdToCode(tx.blockchain), tx.txId));
    },
    getEthTx(tx) {
      return dispatch(transaction.actions.getEthTx(blockchainIdToCode(tx.blockchain), tx.txId));
    },
    goBack() {
      dispatch(screen.actions.goBack());
    },
    goToCancelTx(tx) {
      dispatch(gotoScreen(screen.Pages.CREATE_TX_CANCEL, tx));
    },
    goToDashboard() {
      dispatch(gotoWalletsScreen());
    },
    goToReceipt(tx) {
      dispatch(screen.actions.openTxReceipt(tx.txId));
    },
    goToSpeedUpTx(tx) {
      dispatch(gotoScreen(screen.Pages.CREATE_TX_SPEED_UP, tx));
    },
  }),
)(withStyles(styles)(TxDetails));
