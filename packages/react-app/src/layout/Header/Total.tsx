import { Units } from '@emeraldwallet/core';
import { accounts, BalanceValueConverted, IState } from '@emeraldwallet/store';
import { Total } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';

export default connect<any, any, any, IState>(
  (state, ownProps) => {
    // Sum of balances of all known accounts.
    const byChain: any[] = [];

    const allAssets = accounts.selectors.allBalances(state);
    const totalBalance = accounts.selectors.fiatTotalBalance(state, allAssets);
    const total = typeof totalBalance === 'undefined'
      ? new Units(0, 2) : totalBalance.balance;
    const fiatCurrency = typeof totalBalance === 'undefined'
      ? '' : totalBalance.token;

    const aggregatedAssets = accounts.selectors.aggregateByAsset(allAssets);
    const assetsSummary = accounts.selectors.withFiatConversion(state, aggregatedAssets);

    assetsSummary.forEach((value: BalanceValueConverted) => {
      byChain.push({
        token: value.source.token,
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
)(Total);
