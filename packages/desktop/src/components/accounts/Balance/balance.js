import React from 'react';
import { connect } from 'react-redux';
import { Balance } from '@emeraldwallet/ui';
import { settings } from '@emeraldwallet/store';

export default connect(
  (state, ownProps) => {
    const fiatCurrency = settings.selectors.fiatCurrency(state);
    const fiatRate = settings.selectors.fiatRate(ownProps.symbol, state);
    return {
      fiatCurrency,
      fiatRate,
    };
  },
  null
)(Balance);
