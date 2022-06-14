import { Uuid } from '@emeraldpay/emerald-vault-core/lib/types';
import { PersistentState } from '@emeraldwallet/core';
import { IState, screen, txhistory } from '@emeraldwallet/store';
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
  tx: PersistentState.Transaction;
}

interface DispatchProps {
  goBack(walletId?: Uuid): void;
  goToDashboard(): void;
  goToReceipt(): void;
}

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

const Component: React.FC<OwnProps & StateProps & DispatchProps & StylesProps> = ({
  classes,
  tx,
  goBack,
  goToDashboard,
  goToReceipt,
}) => {
  return (
    <Page title="Transaction Details" leftIcon={<Back onClick={() => goBack()} />}>
      <FormRow
        leftColumn={<div className={classes.fieldName}>Hash</div>}
        rightColumn={<Typography>{tx.txId}</Typography>}
      />
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
    const tx = txhistory.selectors.selectByHash(state, ownProps.hash);

    if (tx == null) {
      throw new Error('Unknown tx: ' + ownProps.hash);
    }

    return { tx };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, ownProps) => ({
    goBack(walletId) {
      if (walletId) {
        dispatch(gotoScreen(screen.Pages.WALLET, walletId));
      } else {
        dispatch(gotoScreen(screen.Pages.HOME));
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
