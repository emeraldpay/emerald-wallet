import { BigAmount } from '@emeraldpay/bigamount';
import { BitcoinEntry } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, blockchainIdToCode, Blockchains } from '@emeraldwallet/core';
import { accounts, IState } from '@emeraldwallet/store';
import { CoinAvatar } from '@emeraldwallet/ui';
import { createStyles, Grid, Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { connect } from 'react-redux';
import AccountBalance from '../../common/Balance';

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    container: {
      border: `0px solid ${theme.palette.divider}`,
      marginBottom: '10px',
    },
    balanceValue: {
      textAlign: 'right',
    },
    balanceSymbol: {
      width: '40px',
      display: 'inline-block',
      textAlign: 'left',
      paddingLeft: '16px',
      opacity: '50%',
    },
  }),
);

interface OwnProps {
  entry: BitcoinEntry;
  walletId: string;
}

interface StateProps {
  balance: BigAmount;
  blockchainCode: BlockchainCode;
}

const Component: React.FC<StateProps & OwnProps> = ({ balance, blockchainCode }) => {
  const styles = useStyles();
  const blockchain = Blockchains[blockchainCode];

  const accountClasses = {
    coinSymbol: styles.balanceSymbol,
    root: styles.balanceValue,
  };

  return (
    <div className={styles.container}>
      <Grid container={true}>
        <Grid container={true}>
          <Grid item={true} xs={1}>
            <CoinAvatar chain={blockchainCode} />
          </Grid>
          <Grid item={true} xs={6}>
            <Typography>{blockchain.getTitle()}</Typography>
          </Grid>
          <Grid item={true} xs={4}>
            <AccountBalance key="main" classes={accountClasses} balance={balance} />
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default connect((state: IState, ownProps: OwnProps): StateProps => {
  const { entry } = ownProps;

  const blockchainCode = blockchainIdToCode(entry.blockchain);
  const balance = accounts.selectors.getBalance(state, entry.id) ?? accounts.selectors.zeroAmountFor(blockchainCode);

  return {
    balance,
    blockchainCode,
  };
})(Component);
