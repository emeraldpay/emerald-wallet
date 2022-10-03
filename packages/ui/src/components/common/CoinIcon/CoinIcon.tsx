import { createStyles, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import * as React from 'react';
import { CurrencyBtc, CurrencyEtc, CurrencyEth, CurrencyUsd, CurrencyUsdt } from '../../../icons';

const useStyles = makeStyles(() =>
  createStyles({
    defaultSize: {
      fill: 'none',
    },
    largeSize: {
      fill: 'none',
      fontSize: '1.2em',
    },
    onlyText: {
      color: '#f0f0f0',
    },
    smallSize: {
      fill: 'none',
      fontSize: '0.5em',
    },
    testnet: {
      fontSize: '0.4em',
      color: '#f0f0f0',
    },
  }),
);

interface OwnProps {
  chain: string;
  size?: 'small' | 'large' | 'default';
}

const CoinIcon: React.FC<OwnProps> = ({ chain, size }) => {
  const styles = useStyles();

  const code = chain.toUpperCase();
  const iconSize = styles[`${size ?? 'default'}Size`];

  switch (code) {
    case 'BTC':
      return <CurrencyBtc className={iconSize} />;
    case 'ETC':
      return <CurrencyEtc className={iconSize} />;
    case 'ETH':
      return <CurrencyEth className={iconSize} />;
    case 'DAI':
      //TODO use icon
      return <Typography className={classNames(iconSize, styles.onlyText)}>DAI</Typography>;
    case 'GOERLI':
      return <Typography className={styles.testnet}>Goerli</Typography>;
    case 'TESTBTC':
      return <Typography className={styles.testnet}>TBTC</Typography>;
    case 'USD':
      return <CurrencyUsd className={iconSize} />;
    case 'USDC':
      //TODO use icon
      return <Typography className={classNames(iconSize, styles.onlyText)}>USDC</Typography>;
    case 'USDT':
      return <CurrencyUsdt className={iconSize} />;
    case 'WETH':
      //TODO use icon
      return <Typography className={classNames(iconSize, styles.onlyText)}>WETH</Typography>;
  }

  return null;
};

export default CoinIcon;
