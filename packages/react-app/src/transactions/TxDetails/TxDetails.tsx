import { Uuid } from '@emeraldpay/emerald-vault-core/lib/types';
import { blockchainById, blockchainIdToCode, isEthereum, PersistentState } from '@emeraldwallet/core';
import { IState, screen, transaction, txhistory } from '@emeraldwallet/store';
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
  hash: string;
}

interface StateProps {
  transaction: PersistentState.Transaction;
}

interface DispatchProps {
  goBack(walletId?: Uuid): void;
  goCancelTx(tx: PersistentState.Transaction): void;
  goSpeedUpTx(tx: PersistentState.Transaction): void;
  goToDashboard(): void;
  goToReceipt(): void;
}

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

const Component: React.FC<OwnProps & StateProps & DispatchProps & StylesProps> = ({
  classes,
  transaction,
  goBack,
  goToDashboard,
  goCancelTx,
  goToReceipt,
}) => {
  const blockchain = React.useMemo(() => blockchainById(transaction.blockchain), [transaction.blockchain]);

  return (
    <Page title="Transaction Details" leftIcon={<Back onClick={() => goBack()} />}>
      <FormRow
        leftColumn={<div className={classes.fieldName}>Hash</div>}
        rightColumn={<Typography>{transaction.txId}</Typography>}
      />
      {blockchain != null && isEthereum(blockchain.params.code) && (
        <FormRow
          leftColumn={<div className={classes.fieldName}>Modify</div>}
          rightColumn={
            <ButtonGroup>
              <Button label="SPEED UP" />
              <Button onClick={() => goCancelTx(transaction)} label="CANCEL TRANSACTION" />
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
    </Page>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, ownProps) => {
    const transaction = txhistory.selectors.selectByHash(state, ownProps.hash);

    if (transaction == null) {
      throw new Error('Unknown tx: ' + ownProps.hash);
    }

    return { transaction };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, ownProps) => ({
    goBack() {
      dispatch(screen.actions.goBack());
    },
    async goCancelTx(tx) {
      const ethTx = await dispatch(transaction.actions.getEthTx(blockchainIdToCode(tx.blockchain), tx.txId));

      if (ethTx != null) {
        dispatch(gotoScreen(screen.Pages.CREATE_TX_CANCEL, ethTx));
      }
    },
    async goSpeedUpTx(tx) {
      const ethTx = await dispatch(transaction.actions.getEthTx(blockchainIdToCode(tx.blockchain), tx.txId));

      if (ethTx != null) {
        dispatch(gotoScreen(screen.Pages.CREATE_TX_SPEED_UP, ethTx));
      }
    },
    goToDashboard() {
      dispatch(gotoWalletsScreen());
    },
    goToReceipt() {
      dispatch(screen.actions.openTxReceipt(ownProps.hash));
    },
  }),
)(withStyles(styles)(Component));
