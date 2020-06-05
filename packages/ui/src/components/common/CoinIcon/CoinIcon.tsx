import {CurrencyBtc, CurrencyEtc, CurrencyEth, CurrencyUsd, CurrencyUsdt} from '@emeraldplatform/ui-icons';
import * as React from 'react';
import {createStyles, makeStyles} from "@material-ui/core/styles";
import {Theme} from "@material-ui/core";

interface ICoinIconProps {
  chain: string;
  size?: "small" | "large" | "default" | undefined;
}

const styles = {
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
};

const CoinIcon = (props: ICoinIconProps) => {
  // const styles = useStyles();
  const fontSize = props.size || "default";
  const style = styles[fontSize + "Size"];

  if (props.chain.toUpperCase() === 'BTC') {
    return (<CurrencyBtc style={style}/>);
  }
  if (props.chain.toUpperCase() === 'ETH') {
    return (<CurrencyEth style={style}/>);
  }
  if (props.chain.toUpperCase() === 'ETC') {
    return (<CurrencyEtc style={style}/>);
  }
  if (props.chain.toUpperCase() === 'USD') {
    return (<CurrencyUsd style={style}/>);
  }
  if (props.chain.toUpperCase() === 'USDT') {
    return (<CurrencyUsdt style={style}/>);
  }
  if (props.chain.toUpperCase() === 'KOVAN') {
    return (<React.Fragment>K</React.Fragment>);
  }
  return null;
};

export default CoinIcon;
