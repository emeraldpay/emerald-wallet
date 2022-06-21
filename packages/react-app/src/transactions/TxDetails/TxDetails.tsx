import { Uuid } from '@emeraldpay/emerald-vault-core/lib/types';
import { blockchainById, blockchainIdToCode, isEthereum } from '@emeraldwallet/core';
import { screen, StoredTransaction, transaction } from '@emeraldwallet/store';
import { Back, Button, ButtonGroup, FormRow, Page } from '@emeraldwallet/ui';
import { createStyles, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import * as React from 'react';
import { connect } from 'react-redux';

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
  goBack(walletId?: Uuid): void;
  goToCancelTx(tx: StoredTransaction): void;
  goToDashboard(): void;
  goToReceipt(tx: StoredTransaction): void;
  goToSpeedUpTx(tx: StoredTransaction): void;
}

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

const Component: React.FC<OwnProps & DispatchProps & StylesProps> = ({
  classes,
  tx,
  goBack,
  goToCancelTx,
  goToDashboard,
  goToReceipt,
}) => {
  const blockchain = React.useMemo(() => (tx == null ? undefined : blockchainById(tx.blockchain)), [tx?.blockchain]);

  return (
    <Page title="Transaction Details" leftIcon={<Back onClick={() => goBack()} />}>
      {tx == null ? (
        <></>
      ) : (
        <>
          <FormRow
            leftColumn={<div className={classes.fieldName}>Hash</div>}
            rightColumn={<Typography>{tx.txId}</Typography>}
          />
          {blockchain != null && isEthereum(blockchain.params.code) && (
            <FormRow
              leftColumn={<div className={classes.fieldName}>Modify</div>}
              rightColumn={
                <ButtonGroup>
                  <Button label="SPEED UP" />
                  <Button onClick={() => goToCancelTx(tx)} label="CANCEL TRANSACTION" />
                </ButtonGroup>
              }
            />
          )}
          <FormRow
            rightColumn={
              <ButtonGroup>
                <Button onClick={goToDashboard} label="DASHBOARD" />
                <Button onClick={goToReceipt} primary={true} label="OPEN RECEIPT" />
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
    goBack() {
      dispatch(screen.actions.goBack());
    },
    async goToCancelTx(tx) {
      const ethTx = await dispatch(transaction.actions.getEthTx(blockchainIdToCode(tx.blockchain), tx.txId));

      if (ethTx != null) {
        dispatch(gotoScreen(screen.Pages.CREATE_TX_CANCEL, ethTx));
      }
    },
    goToDashboard() {
      dispatch(gotoWalletsScreen());
    },
    goToReceipt(tx) {
      dispatch(screen.actions.openTxReceipt(tx.txId));
    },
    async goToSpeedUpTx(tx) {
      const ethTx = await dispatch(transaction.actions.getEthTx(blockchainIdToCode(tx.blockchain), tx.txId));

      if (ethTx != null) {
        dispatch(gotoScreen(screen.Pages.CREATE_TX_SPEED_UP, ethTx));
      }
    },
  }),
)(withStyles(styles)(Component));
