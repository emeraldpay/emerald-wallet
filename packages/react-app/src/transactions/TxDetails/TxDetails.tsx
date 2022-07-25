import { FormatterBuilder } from '@emeraldpay/bigamount';
import { Wei } from '@emeraldpay/bigamount-crypto';
import { Uuid } from '@emeraldpay/emerald-vault-core/lib/types';
import {
  blockchainById,
  blockchainIdToCode,
  EthereumTransaction,
  isEthereum,
  PersistentState,
} from '@emeraldwallet/core';
import { screen, StoredTransaction, transaction } from '@emeraldwallet/store';
import { Address, Back, Balance, Button, ButtonGroup, FormRow, Page } from '@emeraldwallet/ui';
import { createStyles, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import * as React from 'react';
import { connect } from 'react-redux';
import { TxStatus } from './TxStatus';

const { Direction } = PersistentState;
const { gotoScreen, gotoWalletsScreen } = screen.actions;

const styles = createStyles({
  fieldName: {
    color: '#747474',
    fontSize: '16px',
    textAlign: 'right',
  },
});

interface OwnProps {
  tx?: StoredTransaction;
}

interface DispatchProps {
  getEthTx(tx: StoredTransaction): Promise<EthereumTransaction>;
  goBack(walletId?: Uuid): void;
  goToCancelTx(tx: EthereumTransaction): void;
  goToDashboard(): void;
  goToReceipt(tx: StoredTransaction): void;
  goToSpeedUpTx(tx: EthereumTransaction): void;
}

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

const feeFormatter = new FormatterBuilder()
  .number(3, true, 2, {
    decimalSeparator: '.',
    groupSeparator: ',',
    groupSize: 3,
  })
  .useOptimalUnit()
  .append(' ')
  .unitCode()
  .build();

const TxDetails: React.FC<OwnProps & DispatchProps & StylesProps> = ({
  classes,
  tx,
  getEthTx,
  goBack,
  goToCancelTx,
  goToDashboard,
  goToReceipt,
  goToSpeedUpTx,
}) => {
  const blockchain = React.useMemo(() => (tx == null ? undefined : blockchainById(tx.blockchain)), [tx]);

  const [ethTx, setEthTx] = React.useState<EthereumTransaction | null>(null);

  React.useEffect(() => {
    if (tx != null && blockchain != null && isEthereum(blockchain.params.code)) {
      (async () => {
        const transaction = await getEthTx(tx);

        setEthTx(transaction);
      })();
    }
  }, [blockchain, tx, getEthTx]);

  return (
    <Page title="Transaction Details" leftIcon={<Back onClick={() => goBack()} />}>
      {tx == null ? (
        <></>
      ) : (
        <>
          <FormRow
            leftColumn={<div className={classes.fieldName}>Date</div>}
            rightColumn={<>{tx.confirmTimestamp?.toUTCString() ?? 'Pending'}</>}
          />
          <FormRow
            leftColumn={<div className={classes.fieldName}>Status</div>}
            rightColumn={<TxStatus state={tx.state} />}
          />
          <FormRow
            leftColumn={<div className={classes.fieldName}>Hash</div>}
            rightColumn={<Typography>{tx.txId}</Typography>}
          />
          <FormRow
            leftColumn={<div className={classes.fieldName}>Block</div>}
            rightColumn={<>{tx.block?.height ?? 'Pending'}</>}
          />
          <br />
          {tx.changes.map((change, index) => {
            return (
              <div key={`${change.address}-${index}`}>
                <FormRow
                  leftColumn={
                    <div className={classes.fieldName}>{change.direction === Direction.EARN ? 'From' : 'To'}</div>
                  }
                  rightColumn={
                    <>
                      <Address address={change.address ?? 'Unknown address'} disableCopy={change.address == null} />
                      <Balance balance={change.amountValue} />
                    </>
                  }
                />
              </div>
            );
          })}
          {ethTx != null && (
            <>
              <FormRow
                leftColumn={<div className={classes.fieldName}>Nonce</div>}
                rightColumn={<Typography>{ethTx.nonce}</Typography>}
              />
              <FormRow
                leftColumn={<div className={classes.fieldName}>Input Data</div>}
                rightColumn={<textarea readOnly={true} rows={10} value={ethTx.data} />}
              />
              {ethTx.gasPrice == null ? (
                <>
                  <FormRow
                    leftColumn={<div className={classes.fieldName}>Max Gas Price</div>}
                    rightColumn={<>{feeFormatter.format(new Wei(ethTx.maxGasPrice ?? 0))}</>}
                  />
                  <FormRow
                    leftColumn={<div className={classes.fieldName}>Priority Gas Price</div>}
                    rightColumn={<>{feeFormatter.format(new Wei(ethTx.priorityGasPrice ?? 0))}</>}
                  />
                </>
              ) : (
                <FormRow
                  leftColumn={<div className={classes.fieldName}>Gas Price</div>}
                  rightColumn={<>{feeFormatter.format(new Wei(ethTx.gasPrice))}</>}
                />
              )}
              <FormRow
                leftColumn={<div className={classes.fieldName}>Modify</div>}
                rightColumn={
                  <ButtonGroup>
                    <Button onClick={() => goToSpeedUpTx(ethTx)} label="SPEED UP" />
                    <Button onClick={() => goToCancelTx(ethTx)} label="CANCEL TRANSACTION" />
                  </ButtonGroup>
                }
              />
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
