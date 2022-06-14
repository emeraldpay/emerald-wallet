import { EntryId } from '@emeraldpay/emerald-vault-core';
import { accounts, IState, txhistory } from '@emeraldwallet/store';
import { createStyles } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { connect } from 'react-redux';
import Addresses from './Addresses';
import Transactions from './Transactions';
import WalletDetails from './WalletDetails';

export const styles = createStyles({
  transContainer: {
    marginTop: '20px',
  },
});

interface OwnProps {
  walletId: string;
}

interface StateProps {
  entryIds: EntryId[];
}

interface DispatchProps {
  loadTransactions(entryIds: EntryId[]): Promise<void>;
}

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

const DetailsPage: React.FC<OwnProps & StateProps & DispatchProps & StylesProps> = ({
  classes,
  entryIds,
  walletId,
  loadTransactions,
}) => {
  React.useEffect(() => {
    (async () => {
      await loadTransactions(entryIds);
    })();
  }, []);

  return (
    <React.Fragment>
      <WalletDetails walletId={walletId} />
      <div className={classes.transContainer}>
        <Transactions walletId={walletId} />
      </div>
      <div className={classes.transContainer}>
        <Addresses walletId={walletId} />
      </div>
    </React.Fragment>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, ownProps) => ({
    entryIds:
      accounts.selectors
        .findWallet(state, ownProps.walletId)
        ?.entries.filter((entry) => !entry.receiveDisabled)
        .map<EntryId>((entry) => entry.id) ?? [],
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, ownProps) => ({
    loadTransactions(entryIds) {
      return dispatch(txhistory.actions.loadTransactions(ownProps.walletId, entryIds));
    },
  }),
)(withStyles(styles)(DetailsPage));
