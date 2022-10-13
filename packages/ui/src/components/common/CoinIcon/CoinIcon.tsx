import { Typography, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import * as React from 'react';
import {
  CurrencyBtc,
  CurrencyDai,
  CurrencyEtc,
  CurrencyEth,
  CurrencyUsd,
  CurrencyUsdc,
  CurrencyUsdt,
} from '../../../icons';

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
    // Mainnet
    case 'BTC':
      return <CurrencyBtc className={iconSize} />;
    case 'ETC':
    case 'WETC':
      return <CurrencyEtc className={iconSize} />;
    case 'ETH':
    case 'WETH':
      return <CurrencyEth className={iconSize} />;
    case 'DAI':
      return <CurrencyDai className={iconSize} />;
    case 'USD':
      return <CurrencyUsd className={iconSize} />;
    case 'USDC':
      return <CurrencyUsdc className={iconSize} />;
    case 'USDT':
      return <CurrencyUsdt className={iconSize} />;
    // Testnet
    case 'GOERLI':
      return <Typography className={styles.testnet}>Goerli</Typography>;
    case 'TESTBTC':
      return <Typography className={styles.testnet}>TBTC</Typography>;
    case 'WETG':
      return <Typography className={classNames(iconSize, styles.onlyText)}>WETG</Typography>;
    // Other
    default:
      return null;
  }
};

export default CoinIcon;
