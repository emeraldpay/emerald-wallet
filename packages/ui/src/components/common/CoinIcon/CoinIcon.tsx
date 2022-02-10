import { CurrencyBtc, CurrencyEtc, CurrencyEth, CurrencyUsd, CurrencyUsdt } from '@emeraldplatform/ui-icons';
import { createStyles, Theme, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import * as React from 'react';

interface CoinIconProps {
  chain: string;
  size?: "small" | "large" | "default" | undefined;
}

const useStyles = makeStyles<Theme>(() =>
  createStyles({
    defaultSize: {
      fill: "none",
    },
    smallSize: {
      fill: "none",
      fontSize: "0.5em",
    },
    largeSize: {
      fill: "none",
      fontSize: "1.2em",
    },
    testnet: {
      fontSize: "0.4em",
      color: "#f0f0f0",
    },
    onlyText: {
      color: "#f0f0f0",
    },
  }),
);

const CoinIcon = (props: CoinIconProps) => {
  const styles = useStyles();

  const code = props.chain.toUpperCase();

  const fontSize = props.size || "default";
  const currentClassName = styles[fontSize + "Size"];

  switch (code) {
    case 'BTC':
      return (
        <CurrencyBtc className={currentClassName} />
      );
    case 'ETC':
      return (
        <CurrencyEtc className={currentClassName} />
      );
    case 'ETH':
      return (
        <CurrencyEth className={currentClassName} />
      );
    case 'DAI':
      //TODO use icon
      return (
        <Typography className={currentClassName + " " + styles.onlyText}>DAI</Typography>
      );
    case 'GOERLI':
      return (
        <Typography className={styles.testnet}>Goerli</Typography>
      );
    case 'KOVAN':
      return (
        <Typography className={styles.testnet}>Kovan</Typography>
      );
    case 'TESTBTC':
      return (
        <Typography className={styles.testnet}>Testnet</Typography>
      );
    case 'USD':
      return (
        <CurrencyUsd className={currentClassName} />
      );
    case 'USDC':
      //TODO use icon
      return (
        <Typography className={currentClassName + " " + styles.onlyText}>USDC</Typography>
      );
    case 'USDT':
      return (
        <CurrencyUsdt className={currentClassName} />
      );
    case 'WETH':
      //TODO use icon
      return (
        <Typography className={currentClassName + " " + styles.onlyText}>WETH</Typography>
      );
  }

  return null;
};

export default CoinIcon;
