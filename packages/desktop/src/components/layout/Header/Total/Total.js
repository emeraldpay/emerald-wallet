// @flow
import React from 'react';
import { connect } from 'react-redux';
import BigNumber from 'bignumber.js';
import { BlockchainCode } from '@emeraldwallet/core';
import { Wei } from '@emeraldplatform/eth';
import { Total } from '@emeraldwallet/ui';
import { addresses } from '@emeraldwallet/store';
import WalletSettings from '../../../../store/wallet/settings';


export default connect(
  (state, ownProps) => {
    // Sum of balances of all known accounts.
    const fiatCurrency = WalletSettings.selectors.fiatCurrency(state);
    const byChain = [];
    const chains = [BlockchainCode.ETC, BlockchainCode.ETH];
    let total = new BigNumber(0);
    chains.forEach((chain) => {
      const chainTotal: Wei = addresses.selectors.selectTotalBalance(chain, state);
      const fiatRate = WalletSettings.selectors.fiatRate(chain, state);
      let fiatAmount = new BigNumber(0);
      if (fiatRate && fiatCurrency) {
        fiatAmount = fiatAmount.plus(chainTotal.toExchange(fiatRate));
      }
      byChain.push({
        chain,
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
  (dispatch, ownProps) => ({})
)(Total);
