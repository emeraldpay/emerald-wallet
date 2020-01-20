import { Wei } from '@emeraldplatform/eth';
import { BlockchainCode, Units } from '@emeraldwallet/core';
import { addresses, settings, State } from '@emeraldwallet/store';
import { Total } from '@emeraldwallet/ui';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import { connect } from 'react-redux';

export default connect<any, any, any, State>(
  (state, ownProps) => {
    // Sum of balances of all known accounts.
    const byChain: any[] = [];

    const allAssets = addresses.selectors.allBalances(state);
    const totalBalance = addresses.selectors.fiatTotalBalance(state, allAssets);
    const total = typeof totalBalance === 'undefined'
      ? new Units(0, 2) : totalBalance.balance;
    const fiatCurrency = typeof totalBalance === 'undefined'
      ? '' : totalBalance.token;

    const aggregatedAssets = addresses.selectors.aggregateByAsset(allAssets);
    const assetsSummary = addresses.selectors.withFiatConversion(state, aggregatedAssets);

    assetsSummary.forEach((value) => {
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
