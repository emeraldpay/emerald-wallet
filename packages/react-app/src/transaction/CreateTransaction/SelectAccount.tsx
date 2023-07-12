import { BigAmount } from '@emeraldpay/bigamount/lib/amount';
import { Uuid, Wallet, WalletEntry, isBitcoinEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import { TokenAmount, blockchainIdToCode } from '@emeraldwallet/core';
import { IState, accounts, screen, tokens } from '@emeraldwallet/store';
import { Back, BlockchainAvatar, Page, WalletReference } from '@emeraldwallet/ui';
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

interface EntryBalance {
  balance: BigAmount;
  entry: WalletEntry;
  tokenBalances: TokenAmount[];
}

interface OwnProps {
  walletId: Uuid;
}

interface StateProps {
  assets: BigAmount[];
  entryBalances: EntryBalance[];
  wallet?: Wallet;
  walletIcon?: string | null;
}

interface DispatchProps {
  onCancel(): void;
  onSelected(entry: WalletEntry): void;
}

const SelectAccount: React.FC<DispatchProps & OwnProps & StateProps> = ({
  assets,
  entryBalances,
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
          <WalletReference balances={assets} walletIcon={walletIcon} wallet={wallet} />
        </Grid>
        <Grid item className={styles.accountsList} xs={12}>
          {entryBalances.map(({ balance, entry, tokenBalances }) => {
            const blockchain = blockchainIdToCode(entry.blockchain);

            return (
              <Grid container key={`acc-balance-${entry.id}`} className={styles.accountLine}>
                <Grid item xs={2} />
                <Grid item xs={1}>
                  <BlockchainAvatar blockchain={blockchain} />
                </Grid>
                <Grid item xs={6}>
                  <AccountBalance balance={balance} />
                  {tokenBalances.map((item) => (
                    <AccountBalance key={`token-${item.token.address}`} balance={item} />
                  ))}
                </Grid>
                <Grid item xs={1}>
                  <Button disabled={balance.isZero()} onClick={() => onSelected(entry)}>
                    Send
                  </Button>
                </Grid>
              </Grid>
            );
          })}
        </Grid>
      </Grid>
    </Page>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { walletId }) => {
    const wallet = accounts.selectors.findWallet(state, walletId);

    let assets: BigAmount[] = [];

    if (wallet != null) {
      assets = accounts.selectors.getWalletBalances(state, wallet);
    }

    const entryBalances: EntryBalance[] = Object.values(
      wallet?.entries
        .filter((entry) => !entry.receiveDisabled)
        .reduce<Record<number, EntryBalance>>((carry, entry) => {
          const blockchainCode = blockchainIdToCode(entry.blockchain);
          const zeroAmount = accounts.selectors.zeroAmountFor(blockchainCode);

          const balance = accounts.selectors.getBalance(state, entry.id, zeroAmount, true) ?? zeroAmount;

          let tokenBalances: TokenAmount[] = [];

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
                tokenBalances: tokenBalances,
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
          }, accountBalance.tokenBalances);

          return {
            ...carry,
            [entry.blockchain]: {
              tokenBalances,
              entry: accountBalance.entry,
              balance: accountBalance.balance.plus(balance),
            },
          };
        }, {}) ?? {},
    );

    return {
      assets,
      entryBalances,
      wallet,
      walletIcon: state.accounts.icons[walletId],
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, { walletId }) => ({
    onSelected(entry: WalletEntry) {
      if (isBitcoinEntry(entry)) {
        dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX_BITCOIN, entry.id, null, true));
      } else if (isEthereumEntry(entry)) {
        dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX_ETHEREUM, { entry }, null, true));
      }
    },
    onCancel() {
      dispatch(screen.actions.gotoScreen(screen.Pages.WALLET, walletId));
    },
  }),
)(SelectAccount);
