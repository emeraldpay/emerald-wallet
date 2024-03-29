import { BigAmount } from '@emeraldpay/bigamount';
import { IState, settings } from '@emeraldwallet/store';
import { Balance } from '@emeraldwallet/ui';
import { connect } from 'react-redux';

interface OwnProps {
  balance: BigAmount;
}

export default connect<unknown, unknown, OwnProps, IState>((state, { balance }) => {
  if (!BigAmount.is(balance)) {
    throw new Error(`Not a balance instance: ${typeof balance} = ${balance}`);
  }

  const fiatCurrency = settings.selectors.fiatCurrency(state);

  if (balance.units == null) {
    console.warn('No units', balance);
  }

  const fiatRate = settings.selectors.fiatRate(state, balance);

  return {
    fiatCurrency,
    fiatRate,
  };
}, null)(Balance);
