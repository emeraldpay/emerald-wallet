import React from 'react';
import { connect } from 'react-redux';
import { Balance } from '@emeraldwallet/ui';
import WalletSettings from '../../../store/wallet/settings';

export default connect(
  (state, ownProps) => {
    const fiatCurrency = WalletSettings.selectors.fiatCurrency(state);
    const fiatRate = WalletSettings.selectors.fiatRate(ownProps.symbol, state);
    return {
      fiatCurrency,
      fiatRate,
    };
  },
  null
)(Balance);
