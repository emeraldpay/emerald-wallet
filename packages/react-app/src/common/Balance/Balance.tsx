import {IState, settings} from '@emeraldwallet/store';
import {Balance} from '@emeraldwallet/ui';
import * as React from 'react';
import {connect} from 'react-redux';
import {BigAmount} from "@emeraldpay/bigamount";

// Component properties
interface OwnProps {
  balance: BigAmount
}

export default connect(
  (state: IState, ownProps: OwnProps) => {
    if (!BigAmount.is(ownProps.balance)) {
      throw new Error("Not a balance instance: " + typeof ownProps.balance + " = " + ownProps.balance);
    }
    const fiatCurrency = settings.selectors.fiatCurrency(state);
    if (typeof ownProps.balance.units == "undefined") {
      console.warn("No units", ownProps.balance);
    }
    const fiatRate = settings.selectors.fiatRate(ownProps.balance.units.top.code, state);
    return {
      fiatCurrency,
      fiatRate
    };
  },
  null
)(Balance);
