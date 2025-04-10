import { IState, accounts } from '@emeraldwallet/store';
import { connect } from 'react-redux';
import TotalButton from './TotalButton';
import { StateProps } from './TotalButton/TotalButton';

export default connect<StateProps, {}, {}, IState>(
  (state) => {
    const allBalances = accounts.selectors.allBalances(state);
    const aggregatedBalances = accounts.selectors.aggregateBalances(allBalances);
    const balances = accounts.selectors.withFiatConversion(state, aggregatedBalances, true);
    const totalBalance = accounts.selectors.fiatTotalBalance(state, allBalances);

    return {
      balances,
      totalBalance,
      loading: state.accounts.loading,
    };
  },
  null,
  null,
  {
    areStatePropsEqual: (next, prev) => {
      if (prev.balances.length !== next.balances.length) {
        return false;
      }
      if (prev.totalBalance == null && next.totalBalance == null) {
        return true;
      }
      if (prev.totalBalance == null || next.totalBalance == null) {
        return false;
      }
      if (!prev.totalBalance.equals(next.totalBalance)) {
        return false;
      }
      return next.loading === prev.loading;
    },
  }
)(TotalButton);
