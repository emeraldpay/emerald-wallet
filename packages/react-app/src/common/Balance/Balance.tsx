import { BigAmount } from '@emeraldpay/bigamount';
import { BlockchainCode } from '@emeraldwallet/core';
import { IState, settings } from '@emeraldwallet/store';
import { Balance } from '@emeraldwallet/ui';
import { connect } from 'react-redux';

interface OwnProps {
  balance: BigAmount;
  blockchain: BlockchainCode;
}

export default connect<unknown, unknown, OwnProps, IState>((state, { balance, blockchain }) => {
  if (!BigAmount.is(balance)) {
    throw new Error(`Not a balance instance: ${typeof balance} = ${balance}`);
  }

  const fiatCurrency = settings.selectors.fiatCurrency(state);

  if (balance.units == null) {
    console.warn('No units', balance);
  }

  const fiatRate = settings.selectors.fiatRate(state, balance.units.top.code, blockchain);

  return {
    fiatCurrency,
    fiatRate,
  };
}, null)(Balance);
