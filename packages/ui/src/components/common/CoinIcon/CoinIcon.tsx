import {CurrencyBtc, CurrencyEtc, CurrencyEth, CurrencyUsd, CurrencyUsdt} from '@emeraldplatform/ui-icons';
import * as React from 'react';
import {createStyles, Theme, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

interface ICoinIconProps {
  chain: string;
  size?: "small" | "large" | "default" | undefined;
}

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    defaultSize: {
      fill: "none"
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
    }
  })
);

const CoinIcon = (props: ICoinIconProps) => {
  const styles = useStyles();
  const fontSize = props.size || "default";
  const currentClassName = styles[fontSize + "Size"];
  const code = props.chain.toUpperCase();

  if (code === 'BTC') {
    return (<CurrencyBtc className={currentClassName}/>);
  }
  if (code === 'ETH') {
    return (<CurrencyEth className={currentClassName}/>);
  }
  if (code === 'ETC') {
    return (<CurrencyEtc className={currentClassName}/>);
  }
  if (code === 'USD') {
    return (<CurrencyUsd className={currentClassName}/>);
  }
  if (code === 'USDT') {
    return (<CurrencyUsdt className={currentClassName}/>);
  }
  if (code === 'DAI') {
    //TODO use icon
    return (<Typography className={currentClassName + " " + styles.onlyText}>DAI</Typography>);
  }
  if (code === 'KOVAN') {
    return (<Typography className={styles.testnet}>Kovan</Typography>);
  }
  if (code === 'TESTBTC') {
    return (<Typography className={styles.testnet}>Testnet</Typography>);
  }
  return null;
};

export default CoinIcon;
