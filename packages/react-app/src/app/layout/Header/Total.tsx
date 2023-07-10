import { IState, accounts } from '@emeraldwallet/store';
import { connect } from 'react-redux';
import TotalButton from './TotalButton';
import { StateProps } from './TotalButton/TotalButton';

export default connect<StateProps, unknown, unknown, IState>((state) => {
  const allBalances = accounts.selectors.allBalances(state);
  const aggregatedBalances = accounts.selectors.aggregateBalances(allBalances);

  const balances = accounts.selectors.withFiatConversion(state, aggregatedBalances, true);
  const totalBalance = accounts.selectors.fiatTotalBalance(state, allBalances);

  return {
    balances,
    totalBalance,
    loading: state.accounts.loading,
  };
})(TotalButton);
