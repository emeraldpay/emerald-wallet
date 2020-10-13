import {Avatar, Theme} from '@material-ui/core';
import {createStyles, makeStyles} from '@material-ui/core/styles';
import * as React from 'react';
import CoinIcon from './CoinIcon';
import classNames from "classnames";
import {ClassNameMap} from "@material-ui/styles";
import {WithDefaults} from "@emeraldwallet/core";

const colors = {
  eth: '#627eea',
  etc: '#00c957',
  btc: '#ff9900',
  testbtc: '#9a7e55'
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    eth: {
      backgroundColor: colors.eth
    },
    etc: {
      backgroundColor: colors.etc
    },
    btc: {
      backgroundColor: colors.btc
    },
    testbtc: {
      backgroundColor: colors.testbtc
    },
    defaultSize: {},
    smallSize: {
      width: theme.spacing(3),
      height: theme.spacing(3),
    },
    largeSize: {
      width: theme.spacing(8),
      height: theme.spacing(8),
      fontSize: "3em"
    },
    center: {
      margin: "0 auto"
    }
  })
);

interface OwnProps {
  chain: string;
  size?: "default" | "small" | "large";
  center?: boolean;
  classes?: Partial<ClassNameMap<ClassKey>>;
}

type ClassKey = 'root' ;

const defaults: Partial<OwnProps> = {
  size: "default"
}

const CoinAvatar = (props: OwnProps) => {
  props = WithDefaults(props, defaults);
  const {
    chain, classes, size
  } = props;

  const avatarClasses = useStyles(props);
  let coinClass = null;
  if (avatarClasses[chain.toLowerCase()]) {
    coinClass = avatarClasses[chain.toLowerCase()];
  }
  const sizeClass = avatarClasses[size + "Size"];

  let center = undefined;
  if (props.center) {
    center = avatarClasses["center"];
  }

  return (
    <Avatar className={classNames(sizeClass, coinClass, center, classes?.root)}>
      <CoinIcon chain={chain} size={size}/>
    </Avatar>
  );
};

export default CoinAvatar;
