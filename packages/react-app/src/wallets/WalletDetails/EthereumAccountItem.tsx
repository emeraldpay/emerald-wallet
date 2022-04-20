import { BigAmount } from '@emeraldpay/bigamount';
import { Wei } from '@emeraldpay/bigamount-crypto';
import { EthereumEntry, WalletEntry } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, blockchainIdToCode, Blockchains } from '@emeraldwallet/core';
import { accounts, IState, screen, tokens } from '@emeraldwallet/store';
import { CoinAvatar } from '@emeraldwallet/ui';
import { createStyles, Grid, Theme, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { Dispatch } from 'react';
import { connect } from 'react-redux';
import AccountBalance from '../../common/Balance';

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    container: {
      border: `0px solid ${theme.palette.divider}`,
      marginBottom: '10px',
    },
    balance: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'end',
    },
    balanceValue: {
      textAlign: 'right',
    },
    balanceSymbol: {
      width: '90px',
      display: 'inline-block',
      textAlign: 'left',
      paddingLeft: '16px',
      opacity: '50%',
    },
  }),
);

interface OwnProps {
  entries: EthereumEntry[];
  walletId: string;
}

interface StateProps {
  balance: Wei;
  blockchainCode: BlockchainCode;
  tokensBalances: BigAmount[];
}

interface DispatchProps {
  onConvert: (entry: WalletEntry) => void;
}

const Component: React.FC<DispatchProps & OwnProps & StateProps> = ({
  entries,
  balance,
  blockchainCode,
  tokensBalances,
  onConvert,
}) => {
  const styles = useStyles();
  const blockchain = Blockchains[blockchainCode];

  const accountClasses = {
    root: styles.balance,
    coins: styles.balanceValue,
    coinSymbol: styles.balanceSymbol,
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
          <Grid item={true} xs={5}>
            <AccountBalance key="main" classes={accountClasses} balance={balance} />
            {tokensBalances.map((token) => (
              <AccountBalance
                key={'token-' + token.units.top.code}
                classes={accountClasses}
                balance={token}
                onConvert={token.units.top.code === 'WETH' ? () => onConvert(entries[0]) : undefined}
              />
            ))}
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default connect(
  (state: IState, ownProps: OwnProps): StateProps => {
    const { entries } = ownProps;
    const [entry] = entries;

    const blockchainCode = blockchainIdToCode(entry.blockchain);
    const zeroAmount = accounts.selectors.zeroAmountFor<Wei>(blockchainCode);

    const balance = entries.reduce(
      (carry, item) => carry.plus(accounts.selectors.getBalance(state, item.id, zeroAmount) ?? zeroAmount),
      zeroAmount,
    );

    const tokensBalances = entries.reduce<Array<BigAmount>>((carry, item) => {
      if (item.address == null) {
        return carry;
      }

      const balances = tokens.selectors.selectBalances(state, item.address.value, blockchainCode) ?? [];

      if (carry.length === 0) {
        return balances;
      }

      return carry.map((balance) => {
        const tokenBalance = balances.find((balanceItem) => balanceItem.units.equals(balance.units));

        if (tokenBalance == null) {
          return balance;
        }

        return balance.plus(tokenBalance);
      });
    }, []);

    return {
      balance,
      blockchainCode,
      tokensBalances,
    };
  },
  (dispatch: Dispatch<any>): DispatchProps => ({
    onConvert: (entry: WalletEntry) => {
      dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX_CONVERT, entry));
    },
  }),
)(Component);
