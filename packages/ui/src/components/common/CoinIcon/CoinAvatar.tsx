import { Avatar } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import CoinIcon from './CoinIcon';

const colors = {
  eth: '#627eea',
  etc: '#00c957'
};

const useStyles = makeStyles(
  createStyles({
    eth: {
      backgroundColor: colors.eth
    },
    etc: {
      backgroundColor: colors.etc
    }
  })
);

interface ICoinAvatarProps {
  chain: string;
}

const CoinAvatar = (props: ICoinAvatarProps) => {
  const {
    chain
  } = props;

  const avatarClasses = useStyles(props);
  let className = null;
  if (avatarClasses[chain.toLowerCase()]) {
    className = avatarClasses[chain.toLowerCase()];
  }

  return (
    <Avatar className={className}>
      <CoinIcon chain={chain}/>
    </Avatar>
  );
};

export default CoinAvatar;
