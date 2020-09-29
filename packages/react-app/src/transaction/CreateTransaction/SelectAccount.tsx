import {connect} from "react-redux";
import * as React from "react";
import {Dispatch} from "react";
import {Box, createStyles, Grid, Theme, Button} from "@material-ui/core";
import {accounts, IBalanceValue, IState, screen, tokens} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import {Uuid, Wallet, WalletEntry, isEthereumEntry} from "@emeraldpay/emerald-vault-core";
import {blockchainIdToCode} from "@emeraldwallet/core";
import {CoinAvatar, WalletReference} from "@emeraldwallet/ui";
import AccountBalance from '../../common/Balance';
import {Address, Page} from "@emeraldplatform/ui";
import {Back} from "@emeraldplatform/ui-icons";
import {BigAmount} from "@emeraldpay/bigamount/lib/amount";

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    accountsList: {
      paddingTop: "32px"
    },
    accountLine: {
      paddingTop: "16px"
    }
  })
);

/**
 *
 */
const Component = (({balances, wallet, allAssets, onCancel, onSelected}: Props & Actions & OwnProps) => {
  const styles = useStyles();

  return <Page
    title={"Select Account to Create Transaction"}
    leftIcon={<Back onClick={() => onCancel()}/>}>
    <Grid container={true}>
      <Grid item={true} xs={12}>
        <WalletReference wallet={wallet} assets={allAssets}/>
      </Grid>
      <Grid item={true} xs={12} className={styles.accountsList}>
        {balances.map((accountBalance) =>
          <Grid container={true} key={"acc-balance-" + accountBalance.account.id} className={styles.accountLine}>
            <Grid item={true} xs={2}>
            </Grid>
            <Grid item={true} xs={1}>
              <CoinAvatar chain={blockchainIdToCode(accountBalance.account.blockchain)}/>
            </Grid>
            {/*<Grid item={true} xs={6}>*/}
            {/*  <Address id={accountBalance.account.address?.value || accountBalance.account.id}/>*/}
            {/*</Grid>*/}
            <Grid item={true} xs={6}>
              <AccountBalance
                key={"main"}
                balance={accountBalance.balance}
              />
              {accountBalance.tokens.map((token) =>
                <AccountBalance
                  key={"token-" + token.units.top.code}
                  balance={token}
                />
              )}
            </Grid>
            <Grid item={true} xs={1}>
              <Button disabled={!acceptAccount(accountBalance)}
                      onClick={() => onSelected(accountBalance.account)}>Send</Button>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Grid>
  </Page>

})

// State Properties
interface Props {
  wallet: Wallet;
  balances: AccountBalance[];
  allAssets: IBalanceValue[];
}

// Actions
interface Actions {
  onSelected: (account: WalletEntry) => void;
  onCancel: () => void;
}

// Component properties
interface OwnProps {
  walletId: Uuid;
}

interface AccountBalance {
  account: WalletEntry;
  balance: BigAmount;
  tokens: BigAmount[]
}

function acceptAccount(balance: AccountBalance): boolean {
  return balance.balance.isPositive();
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    const wallet = accounts.selectors.findWallet(state, ownProps.walletId)!;
    const allAssets: IBalanceValue[] = accounts.selectors.getWalletBalances(state, wallet, false);
    const balances: AccountBalance[] = wallet.entries.map((account) => {
      const blockchain = blockchainIdToCode(account.blockchain);
      const zero = accounts.selectors.zeroAmountFor(blockchain);
      let tokenBalances: BigAmount[] = []
      if (isEthereumEntry(account)) {
        tokenBalances = tokens.selectors.selectBalances(state, account.address!.value, blockchain) || [];
      }
      return {
        account,
        balance: accounts.selectors.getBalance(state, account.id) || zero,
        tokens: tokenBalances
      }
    })
    return {
      wallet, balances, allAssets
    }
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {
      onSelected: (account: WalletEntry) => {
        dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX_ACCOUNT, account));
      },
      onCancel: () => {
        dispatch(screen.actions.gotoScreen(screen.Pages.WALLET, ownProps.walletId))
      }
    }
  }
)((Component));