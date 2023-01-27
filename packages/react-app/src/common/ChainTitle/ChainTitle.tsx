import { BlockchainCode } from '@emeraldwallet/core';
import { CoinAvatar, PageTitle } from '@emeraldwallet/ui';
import { createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';

const useStyles = makeStyles(
  createStyles({
    container: {
      display: 'flex',
      alignItems: 'center',
    },
    icon: {
      paddingRight: 10,
    },
  }),
);

export interface OwnProps {
  blockchain: BlockchainCode;
  title?: string;
}

const ChainTitle: React.FC<OwnProps> = ({ blockchain, title = '' }) => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <CoinAvatar blockchain={blockchain} className={styles.icon} />
      <PageTitle>{title}</PageTitle>
    </div>
  );
};

export default ChainTitle;
