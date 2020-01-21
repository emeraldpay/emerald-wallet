import { IState, settings } from '@emeraldwallet/store';
import { Balance } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';

export default connect<any, any, any, IState>(
  (state: IState, ownProps: any) => {
    const fiatCurrency = settings.selectors.fiatCurrency(state);
    const fiatRate = settings.selectors.fiatRate(ownProps.symbol, state);
    return {
      fiatCurrency,
      fiatRate
    };
  },
  null
)(Balance);
