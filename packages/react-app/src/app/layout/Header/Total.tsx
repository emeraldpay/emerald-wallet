import { BalanceValueConverted, IState, accounts } from '@emeraldwallet/store';
import { connect } from 'react-redux';
import TotalButton from './TotalButton';
import { FiatCurrencies, StateProps } from './TotalButton/TotalButton';

export default connect<StateProps, unknown, unknown, IState>((state) => {
  const balances = accounts.selectors.allBalances(state);
  const total = accounts.selectors.fiatTotalBalance(state, balances);

  const assets = accounts.selectors.aggregateByAsset(balances);
  const summary = accounts.selectors.withFiatConversion(state, assets);

  const fiatCurrencies: FiatCurrencies[] = summary.map((value: BalanceValueConverted) => ({
    fiatAmount: value.converted,
    fiatRate: value.rate,
    token: value.source.balance.units.top.code,
    total: value.source.balance,
  }));

  return {
    fiatCurrencies,
    loading: state.accounts.loading,
    totalBalance: total,
  };
})(TotalButton);
