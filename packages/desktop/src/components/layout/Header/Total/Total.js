// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Currency } from '@emeraldwallet/core';
import { withStyles } from '@material-ui/core';
import { Wei } from '@emeraldplatform/emerald-js';
import { CurrencyEtc, CurrencyEth } from '@emeraldplatform/ui-icons';
import { Button } from '@emeraldwallet/ui';
import Accounts from '../../../../store/vault/accounts';
import Wallet from '../../../../store/wallet';
import WalletSettings from '../../../../store/wallet/settings';

type Props = {
  total: string,
  showFiat?: boolean,
  fiatAmount?: string,
  fiatCurrency?: string,
};

const styles = {
  text: {
    textTransform: 'none',
    fontWeight: 'normal',
    fontSize: '16px',
  },
  root: {
    lineHeight: 'inherit',
  },
};

const CoinSymbol = ({ coinTicker }) => {
  if (coinTicker === 'ETH') {
    return (<CurrencyEth />);
  }
  if (coinTicker === 'ETC') {
    return (<CurrencyEtc />);
  }
  return null;
};

const Total = ({
  total, showFiat, fiatAmount, fiatCurrency, classes, tokenSymbol,
}: Props) => {
  let totalFormatted = `${total} ${tokenSymbol}`;
  if (showFiat && fiatAmount) {
    totalFormatted = `${totalFormatted} - ${fiatAmount} ${fiatCurrency}`;
  }
  return (
    <Button
      color="secondary"
      variant="text"
      disabled={true}
      label={totalFormatted}
      classes={classes}
      icon={<CoinSymbol coinTicker={tokenSymbol} />}
    />
  );
};

Total.propTypes = {
  showFiat: PropTypes.bool,
  total: PropTypes.string.isRequired,
};

const StyledTotal = withStyles(styles)(Total);

export default connect(
  (state, ownProps) => {
    // Sum of balances of all known accounts.
    const blockchain = Wallet.selectors.currentBlockchain(state);
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
      tokenSymbol: (blockchain && blockchain.params.coinTicker) || '',
    };
  },
  (dispatch, ownProps) => ({})
)(StyledTotal);
