import { BigAmount } from '@emeraldpay/bigamount/lib/amount';
import { Uuid, Wallet, WalletEntry, isBitcoinEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import { blockchainIdToCode } from '@emeraldwallet/core';
import { IBalanceValue, IState, accounts, screen, tokens } from '@emeraldwallet/store';
import { Back, CoinAvatar, Page, WalletReference } from '@emeraldwallet/ui';
import { Button, Grid, Typography, createStyles } from '@material-ui/core';
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
  assets: IBalanceValue[];
  balances: AccountBalance[];
  wallet?: Wallet;
  walletIcon?: string | null;
}

interface DispatchProps {
  onCancel(): void;
  onSelected(account: WalletEntry): void;
}

function acceptAccount({ balance }: AccountBalance): boolean {
  return balance.isPositive();
}

const SelectAccount: React.FC<DispatchProps & OwnProps & StateProps> = ({
  assets,
  balances,
  wallet,
  walletIcon,
  onCancel,
  onSelected,
}) => {
  const styles = useStyles();

  return wallet == null ? (
    <Alert>
      <Typography>Wallet is not found</Typography>
    </Alert>
  ) : (
    <Page title="Select Account to Create Transaction" leftIcon={<Back onClick={() => onCancel()} />}>
      <Grid container>
        <Grid item xs={12}>
          <WalletReference assets={assets} walletIcon={walletIcon} wallet={wallet} />
        </Grid>
        <Grid item className={styles.accountsList} xs={12}>
          {balances.map((item) => (
            <Grid container key={`acc-balance-${item.entry.id}`} className={styles.accountLine}>
              <Grid item xs={2} />
              <Grid item xs={1}>
                <CoinAvatar blockchain={blockchainIdToCode(item.entry.blockchain)} />
              </Grid>
              <Grid item xs={6}>
                <AccountBalance balance={item.balance} />
                {item.tokens.map((token) => (
                  <AccountBalance key={`token-${token.units.top.code}`} balance={token} />
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
  (state, { walletId }) => {
    const wallet = accounts.selectors.findWallet(state, walletId);

    let assets: IBalanceValue[] = [];

    if (wallet != null) {
      assets = accounts.selectors.getWalletBalances(state, wallet);
    }

    const balances: AccountBalance[] = Object.values(
      wallet?.entries
        .filter((entry) => !entry.receiveDisabled)
        .reduce<Record<number, AccountBalance>>((carry, entry) => {
          const blockchainCode = blockchainIdToCode(entry.blockchain);
          const zeroAmount = accounts.selectors.zeroAmountFor(blockchainCode);

          const balance = accounts.selectors.getBalance(state, entry.id, zeroAmount, true) ?? zeroAmount;

          let tokenBalances: BigAmount[] = [];

          if (isEthereumEntry(entry) && entry.address != null) {
            tokenBalances = tokens.selectors.selectBalances(state, blockchainCode, entry.address.value) ?? [];
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

          tokenBalances = tokenBalances.reduce((carry, token) => {
            const index = carry.findIndex((item) => item.units.equals(token.units));

            if (index === -1) {
              return [...carry, token];
            }

            carry.splice(index, 1, carry[index].plus(token));

            return carry;
          }, accountBalance.tokens);

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
      assets,
      balances,
      wallet,
      walletIcon: state.accounts.icons[walletId],
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, { walletId }) => ({
    onSelected(account: WalletEntry) {
      if (isBitcoinEntry(account)) {
        dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX_BITCOIN, account.id, null, true));
      } else if (isEthereumEntry(account)) {
        dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX_ETHEREUM, account, null, true));
      }
    },
    onCancel() {
      dispatch(screen.actions.gotoScreen(screen.Pages.WALLET, walletId));
    },
  }),
)(SelectAccount);
