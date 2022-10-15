import { AnyCoinCode, CurrencyAmount } from '@emeraldwallet/core';
import { BalanceValueConverted, IState, accounts } from '@emeraldwallet/store';
import { connect } from 'react-redux';
import TotalButton from './TotalButton';
import { FiatCurrencies, StateProps } from './TotalButton/TotalButton';

export default connect<StateProps, {}, {}, IState>((state) => {
  const balances = accounts.selectors.allBalances(state);
  const total = accounts.selectors.fiatTotalBalance(state, balances);

  const assets = accounts.selectors.aggregateByAsset(balances);
  const summary = accounts.selectors.withFiatConversion(state, assets);

  const fiatCurrencies: FiatCurrencies[] = summary.map((value: BalanceValueConverted) => ({
    fiatAmount: value.converted.balance,
    fiatRate: value.rate,
    token: value.source.balance.units.top.code as AnyCoinCode,
    total: value.source.balance,
  }));

  return {
    fiatCurrencies,
    totalBalance: total?.balance ?? new CurrencyAmount(0, state.settings.localeCurrency),
  };
})(TotalButton);
