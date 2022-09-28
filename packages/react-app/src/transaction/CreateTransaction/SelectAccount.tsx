import { BigAmount } from '@emeraldpay/bigamount/lib/amount';
import { isBitcoinEntry, isEthereumEntry, Uuid, Wallet, WalletEntry } from '@emeraldpay/emerald-vault-core';
import { blockchainIdToCode } from '@emeraldwallet/core';
import { accounts, IBalanceValue, IState, screen, tokens } from '@emeraldwallet/store';
import { Back, CoinAvatar, Page, WalletReference } from '@emeraldwallet/ui';
import { Button, createStyles, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Alert } from '@material-ui/lab';
import * as React from 'react';
import { connect } from 'react-redux';
import AccountBalance from '../../common/Balance';

const useStyles = makeStyles(
  createStyles({
    accountsList: {
      paddingTop: 32,
    },
    accountLine: {
      paddingTop: 16,
    },
  }),
);

interface AccountBalance {
  balance: BigAmount;
  entry: WalletEntry;
  tokens: BigAmount[];
}

interface OwnProps {
  walletId: Uuid;
}

interface StateProps {
  allAssets: IBalanceValue[];
  balances: AccountBalance[];
  wallet?: Wallet;
}

interface DispatchProps {
  onCancel(): void;
  onSelected(account: WalletEntry): void;
}

function acceptAccount({ balance }: AccountBalance): boolean {
  return balance.isPositive();
}

const Component: React.FC<DispatchProps & OwnProps & StateProps> = ({
  allAssets,
  balances,
  wallet,
  onCancel,
  onSelected,
}) => {
  if (wallet == null) {
    return (
      <Alert>
        <Typography>Wallet is not found</Typography>
      </Alert>
    );
  }

  const styles = useStyles();

  return (
    <Page title={'Select Account to Create Transaction'} leftIcon={<Back onClick={() => onCancel()} />}>
      <Grid container>
        <Grid item xs={12}>
          <WalletReference assets={allAssets} wallet={wallet} />
        </Grid>
        <Grid item className={styles.accountsList} xs={12}>
          {balances.map((item) => (
            <Grid container key={'acc-balance-' + item.entry.id} className={styles.accountLine}>
              <Grid item xs={2} />
              <Grid item xs={1}>
                <CoinAvatar chain={blockchainIdToCode(item.entry.blockchain)} />
              </Grid>
              <Grid item xs={6}>
                <AccountBalance key={'main'} balance={item.balance} />
                {item.tokens.map((token) => (
                  <AccountBalance key={'token-' + token.units.top.code} balance={token} />
                ))}
              </Grid>
              <Grid item xs={1}>
                <Button disabled={!acceptAccount(item)} onClick={() => onSelected(item.entry)}>
                  Send
                </Button>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Page>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, ownProps) => {
    const wallet = accounts.selectors.findWallet(state, ownProps.walletId);

    let allAssets: IBalanceValue[] = [];

    if (wallet != null) {
      allAssets = accounts.selectors.getWalletBalances(state, wallet, false);
    }

    const balances: AccountBalance[] = Object.values(
      wallet?.entries
        .filter((entry) => !entry.receiveDisabled)
        .reduce<Record<number, AccountBalance>>((carry, entry) => {
          const blockchainCode = blockchainIdToCode(entry.blockchain);
          const zeroAmount = accounts.selectors.zeroAmountFor(blockchainCode);

          const balance = accounts.selectors.getBalance(state, entry.id, zeroAmount) ?? zeroAmount;

          let tokenBalances: BigAmount[] = [];

          if (isEthereumEntry(entry) && entry.address != null) {
            tokenBalances = tokens.selectors.selectBalances(state, entry.address.value, blockchainCode) ?? [];
          }

          const accountBalance = carry[entry.blockchain];

          if (accountBalance == null) {
            return {
              ...carry,
              [entry.blockchain]: {
                balance,
                entry,
                tokens: tokenBalances,
              },
            };
          }

          tokenBalances = accountBalance.tokens.reduce<Array<BigAmount>>((carry, item) => {
            const tokenBalance = tokenBalances.find((balanceItem) => balanceItem.units.equals(item.units));

            if (tokenBalance == null) {
              return carry;
            }

            return [...carry, item.plus(tokenBalance)];
          }, []);

          return {
            ...carry,
            [entry.blockchain]: {
              entry: accountBalance.entry,
              balance: accountBalance.balance.plus(balance),
              tokens: tokenBalances,
            },
          };
        }, {}) ?? {},
    );

    return {
      allAssets,
      balances,
      wallet,
    };
  },
  (dispatch, ownProps) => ({
    onSelected: (account: WalletEntry) => {
      if (isBitcoinEntry(account)) {
        dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX_BITCOIN, account.id, null, true));
      } else if (isEthereumEntry(account)) {
        dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX_ETHEREUM, account, null, true));
      }
    },
    onCancel: () => {
      dispatch(screen.actions.gotoScreen(screen.Pages.WALLET, ownProps.walletId));
    },
  }),
)(Component);
