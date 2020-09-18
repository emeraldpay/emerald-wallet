import { accounts, BalanceValueConverted, IState } from '@emeraldwallet/store';
import TotalButton from './TotalButton';
import {connect} from 'react-redux';
import {CurrencyAmount} from "@emeraldwallet/core";

export default connect<any, any, any, IState>(
  (state, ownProps) => {
    // Sum of balances of all known accounts.
    const byChain: any[] = [];

    const allAssets = accounts.selectors.allBalances(state);
    const totalBalance = accounts.selectors.fiatTotalBalance(state, allAssets);
    const total = typeof totalBalance === 'undefined'
      ? new CurrencyAmount(0, state.settings.localeCurrency) : totalBalance.balance;
    const fiatCurrency = typeof totalBalance === 'undefined'
      ? '' : totalBalance.balance.units.top.code;

    const aggregatedAssets = accounts.selectors.aggregateByAsset(allAssets);
    const assetsSummary = accounts.selectors.withFiatConversion(state, aggregatedAssets);

    assetsSummary.forEach((value: BalanceValueConverted) => {
      byChain.push({
        total: value.source.balance,
        fiatRate: value.rate,
        fiatAmount: value.converted.balance
      });
    });

    return {
      fiatCurrency,
      byChain,
      total
    };
  },
  null
)(TotalButton);
