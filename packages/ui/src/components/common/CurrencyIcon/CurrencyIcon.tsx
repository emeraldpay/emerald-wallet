import { BlockchainCode } from '@emeraldwallet/core';
import { Typography, createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';
import { CurrencyBtc, CurrencyDai, CurrencyEtc, CurrencyEth, CurrencyUsdc, CurrencyUsdt } from '../../../icons';
import CoinAvatar from '../CoinIcon/CoinAvatar';

const useStyles = makeStyles(() =>
  createStyles({
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
    testnet: {
      fontSize: '0.4em',
      color: '#f0f0f0',
    },
  }),
);

interface OwnProps {
  center?: boolean;
  className?: string;
  currency: string;
  size?: 'small' | 'large' | 'default';
}

const CurrencyIcon: React.FC<OwnProps> = ({ currency, size = 'default', ...props }) => {
  const styles = useStyles();

  const iconSize = styles[`${size}Size`];

  let blockchain: BlockchainCode;
  let icon: React.ReactElement | null;

  switch (currency) {
    // Mainnet
    case 'BTC':
      blockchain = BlockchainCode.BTC;
      icon = <CurrencyBtc className={iconSize} />;
      break;
    case 'ETC':
    case 'WETC':
      blockchain = BlockchainCode.ETC;
      icon = <CurrencyEtc className={iconSize} />;
      break;
    case 'ETH':
    case 'WETH':
      blockchain = BlockchainCode.ETH;
      icon = <CurrencyEth className={iconSize} />;
      break;
    case 'DAI':
      blockchain = BlockchainCode.ETH;
      icon = <CurrencyDai className={iconSize} />;
      break;
    case 'USDC':
      blockchain = BlockchainCode.ETH;
      icon = <CurrencyUsdc className={iconSize} />;
      break;
    case 'USDT':
      blockchain = BlockchainCode.ETH;
      icon = <CurrencyUsdt className={iconSize} />;
      break;
    // Testnet
    case 'ETG':
    case 'WETG':
      blockchain = BlockchainCode.Goerli;
      icon = <Typography className={styles.testnet}>ETG</Typography>;
      break;
    case 'TESTBTC':
      blockchain = BlockchainCode.TestBTC;
      icon = <Typography className={styles.testnet}>TBTC</Typography>;
      break;
    case 'WEENUS':
      blockchain = BlockchainCode.Goerli;
      icon = <Typography className={styles.testnet}>WNS</Typography>;
      break;
    // Other
    default:
      blockchain = BlockchainCode.Unknown;
      icon = null;
  }

  return icon == null ? null : (
    <CoinAvatar blockchain={blockchain} size={size} {...props}>
      {icon}
    </CoinAvatar>
  );
};

export default CurrencyIcon;
