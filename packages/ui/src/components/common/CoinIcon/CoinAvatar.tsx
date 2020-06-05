import {Avatar, Theme} from '@material-ui/core';
import {createStyles, makeStyles} from '@material-ui/core/styles';
import * as React from 'react';
import CoinIcon from './CoinIcon';
import classNames from "classnames";

const colors = {
  eth: '#627eea',
  etc: '#00c957'
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    eth: {
      backgroundColor: colors.eth
    },
    etc: {
      backgroundColor: colors.etc
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
  })
);

interface ICoinAvatarProps {
  chain: string;
  size?: "default" | "small" | "large"
}

const CoinAvatar = (props: ICoinAvatarProps) => {
  const {
    chain
  } = props;
  const size = props.size || "default";

  const avatarClasses = useStyles(props);
  let coinClass = null;
  if (avatarClasses[chain.toLowerCase()]) {
    coinClass = avatarClasses[chain.toLowerCase()];
  }
  const sizeClass = avatarClasses[size + "Size"];

  return (
    <Avatar className={classNames(sizeClass, coinClass)}>
      <CoinIcon chain={chain} size={size}/>
    </Avatar>
  );
};

export default CoinAvatar;
