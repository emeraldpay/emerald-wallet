// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Wei } from 'emerald-js';
import { EtcSimple } from 'emerald-js-ui/lib/icons3';
import { FlatButton } from 'material-ui';
import muiThemeable from 'material-ui/styles/muiThemeable';
import Accounts from '../../../../store/vault/accounts';
import WalletSettings from '../../../../store/wallet/settings';
import { Currency } from '../../../../lib/currency';

type Props = {
  total: string,
  showFiat?: boolean,
  fiatAmount?: string,
  fiatCurrency?: string,
};

const Total = ({ total, showFiat, fiatAmount, fiatCurrency, muiTheme }: Props) => {
  let totalFormatted = `${total} ETC`;
  if (showFiat && fiatAmount) {
    totalFormatted = `${totalFormatted} - ${fiatAmount} ${fiatCurrency}`;
  }
  return (
    <FlatButton
      disabled={true}
      label={totalFormatted}
      style={{color: muiTheme.palette.secondaryTextColor, lineHeight: 'inherit'}}
      labelStyle={{
        textTransform: 'none',
        fontWeight: 'normal',
        fontSize: '16px',
      }}
      icon={<EtcSimple style={{color: muiTheme.palette.secondaryTextColor}}/>}
    />
  );
};

Total.propTypes = {
  showFiat: PropTypes.bool,
  total: PropTypes.string.isRequired,
};

export default connect(
  (state, ownProps) => {
    // Sum of balances of all known accounts.
    const total: Wei = Accounts.selectors.selectTotalBalance(state);
    const fiatCurrency = WalletSettings.selectors.fiatCurrency(state);
    const fiatRate = WalletSettings.selectors.fiatRate(state);
    let fiatAmount;
    if (fiatRate && fiatCurrency) {
      fiatAmount = Currency.format(Currency.convert(total.getEther(), fiatRate), fiatCurrency);
    }

    return {
      fiatCurrency,
      fiatAmount,
      total: total.getEther(),
    };
  },
  (dispatch, ownProps) => ({})
)(muiThemeable()(Total));
