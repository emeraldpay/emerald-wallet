import { CurrencyBtc, CurrencyEtc, CurrencyEth, CurrencyUsd, CurrencyUsdt } from '@emeraldplatform/ui-icons';
import * as React from 'react';

interface ICoinIconProps {
  chain: string;
}

const CoinIcon = (props: ICoinIconProps) => {
  if (props.chain.toUpperCase() === 'BTC') {
    return (<CurrencyBtc />);
  }
  if (props.chain.toUpperCase() === 'ETH') {
    return (<CurrencyEth />);
  }
  if (props.chain.toUpperCase() === 'ETC') {
    return (<CurrencyEtc />);
  }
  if (props.chain.toUpperCase() === 'USD') {
    return (<CurrencyUsd />);
  }
  if (props.chain.toUpperCase() === 'USDT') {
    return (<CurrencyUsdt />);
  }
  if (props.chain.toUpperCase() === 'KOVAN') {
    return (<React.Fragment>K</React.Fragment>);
  }
  return null;
};

export default CoinIcon;
