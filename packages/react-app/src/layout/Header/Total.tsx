import * as React from 'react';
import { connect } from 'react-redux';
import BigNumber from 'bignumber.js';
import { BlockchainCode } from '@emeraldwallet/core';
import { Wei } from '@emeraldplatform/eth';
import { Total } from '@emeraldwallet/ui';
import { addresses, settings } from '@emeraldwallet/store';

export default connect(
  (state, ownProps) => {
    // Sum of balances of all known accounts.
    const fiatCurrency = settings.selectors.fiatCurrency(state);
    const byChain: Array<any> = [];
    // TODO use configured chains
    const chains = [BlockchainCode.ETC, BlockchainCode.ETH];
    let total = new BigNumber(0);
    chains.forEach((blockchain) => {
      const chainTotal: Wei = addresses.selectors.balanceByChain(state, blockchain);
      const fiatRate = settings.selectors.fiatRate(blockchain, state);
      let fiatAmount = new BigNumber(0);
      if (fiatRate && fiatCurrency) {
        fiatAmount = fiatAmount.plus(chainTotal.toExchange(fiatRate));
      }
      byChain.push({
        blockchain,
        total: chainTotal,
        fiatRate,
        fiatAmount,
      });
      total = total.plus(fiatAmount);
    });

    return {
      fiatCurrency,
      byChain,
      total,
    };
  },
  null
)(Total);
