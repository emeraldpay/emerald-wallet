import { BlockchainCode } from '@emeraldwallet/core';
import { Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';
import { CurrencyBtc, CurrencyEtc, CurrencyEth } from '../../../icons';

const useStyles = makeStyles()({
  commonIcon: {
    fontSize: '0.4em',
    color: '#f0f0f0',
  },
  defaultSize: {
    fill: 'none',
  },
  largeSize: {
    fill: 'none',
    fontSize: '1.2em',
  },
  smallSize: {
    fill: 'none',
    fontSize: '0.5em',
  },
});

interface OwnProps {
  blockchain: BlockchainCode;
  size?: 'small' | 'large' | 'default';
}

const BlockchainIcon: React.FC<OwnProps> = ({ blockchain, size }) => {
  const { classes } = useStyles();

  const iconSize = classes[`${size ?? 'default'}Size`];

  switch (blockchain) {
    // Mainnet
    case BlockchainCode.BTC:
      return <CurrencyBtc className={iconSize} />;
    case BlockchainCode.ETC:
      return <CurrencyEtc className={iconSize} />;
    case BlockchainCode.ETH:
      return <CurrencyEth className={iconSize} />;
    // Testnet
    case BlockchainCode.Sepolia:
      return <Typography className={classes.commonIcon}>Sepolia</Typography>;
    case BlockchainCode.TestBTC:
      return <Typography className={classes.commonIcon}>TBTC</Typography>;
    // Other
    default:
      return null;
  }
};

export default BlockchainIcon;
