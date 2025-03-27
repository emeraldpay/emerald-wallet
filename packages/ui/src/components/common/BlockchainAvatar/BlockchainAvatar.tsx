import { BlockchainCode } from '@emeraldwallet/core';
import { Avatar } from '@mui/material';
import classNames from 'classnames';
import * as React from 'react';
import BlockchainIcon from './BlockchainIcon';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
    container: {
      display: 'inline-block',
    },
    btcBlockchain: {
      backgroundColor: '#f90',
    },
    etcBlockchain: {
      backgroundColor: '#00c957',
    },
    ethBlockchain: {
      backgroundColor: '#627eea',
    },
    sepoliaBlockchain: {
      backgroundColor: '#4a4f55',
    },
    testbtcBlockchain: {
      backgroundColor: '#9a7e55',
    },
    unknownBlockchain: {
      backgroundColor: 'transparent',
    },
    defaultSize: {
      width: theme.spacing(4),
      height: theme.spacing(4),
    },
    smallSize: {
      width: theme.spacing(3),
      height: theme.spacing(3),
    },
    largeSize: {
      width: theme.spacing(8),
      height: theme.spacing(8),
      fontSize: '3em',
    },
  }
));

interface OwnProps {
  blockchain: BlockchainCode;
  className?: string;
  size?: 'default' | 'small' | 'large';
}

const BlockchainAvatar: React.FC<OwnProps> = ({ blockchain, className, size = 'default' }) => {
  const styles = useStyles().classes;

  return (
    <div className={classNames(styles.container, className)}>
      <Avatar className={classNames(styles[`${blockchain.toLowerCase()}Blockchain`], styles[`${size}Size`])}>
        <BlockchainIcon blockchain={blockchain} size={size} />
      </Avatar>
    </div>
  );
};

export default BlockchainAvatar;
