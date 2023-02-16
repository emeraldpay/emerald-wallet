import { BigAmount } from '@emeraldpay/bigamount';
import { BitcoinEntry } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, Blockchains, blockchainIdToCode } from '@emeraldwallet/core';
import { IState, accounts } from '@emeraldwallet/store';
import { CoinAvatar } from '@emeraldwallet/ui';
import { Typography, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import AccountBalance from '../../common/Balance';

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      alignItems: 'start',
      display: 'flex',
      marginTop: theme.spacing(2),
    },
    firstItem: {
      marginTop: 0,
    },
    icon: {
      marginRight: theme.spacing(),
    },
    title: {
      alignItems: 'center',
      display: 'flex',
      flex: '1 1 auto',
      height: theme.spacing(4),
    },
    balances: {
      marginLeft: theme.spacing(),
    },
    balanceValue: {
      textAlign: 'right',
    },
    balanceSymbol: {
      display: 'inline-block',
      opacity: '50%',
      paddingLeft: 16,
      textAlign: 'left',
      width: 100,
    },
  }),
);

interface OwnProps {
  entry: BitcoinEntry;
  firstItem?: boolean;
  walletId: string;
}

interface StateProps {
  balance: BigAmount;
  blockchainCode: BlockchainCode;
}

const BitcoinEntryItem: React.FC<StateProps & OwnProps> = ({ balance, blockchainCode, firstItem = false }) => {
  const styles = useStyles();

  const classes = {
    coinSymbol: styles.balanceSymbol,
    root: styles.balanceValue,
  };

  const blockchain = Blockchains[blockchainCode];

  return (
    <div className={classNames(styles.container, firstItem ? styles.firstItem : null)}>
      <div className={styles.icon}>
        <CoinAvatar blockchain={blockchainCode} />
      </div>
      <div className={styles.title}>
        <Typography>{blockchain.getTitle()}</Typography>
      </div>
      <div className={styles.balances}>
        <AccountBalance key="main" classes={classes} balance={balance} />
      </div>
    </div>
  );
};

export default connect((state: IState, ownProps: OwnProps): StateProps => {
  const { entry } = ownProps;

  const blockchainCode = blockchainIdToCode(entry.blockchain);
  const balance = accounts.selectors.getBalance(state, entry.id, accounts.selectors.zeroAmountFor(blockchainCode));

  return {
    balance,
    blockchainCode,
  };
})(BitcoinEntryItem);
