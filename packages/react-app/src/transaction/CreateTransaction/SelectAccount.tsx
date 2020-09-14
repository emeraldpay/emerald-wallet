import {connect} from "react-redux";
import * as React from "react";
import {Dispatch} from "react";
import {Box, createStyles, Grid, Theme, Button} from "@material-ui/core";
import {accounts, IBalanceValue, IState, screen, tokens} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import {Uuid, Wallet, WalletEntry, isEthereumEntry} from "@emeraldpay/emerald-vault-core";
import {Units, blockchainIdToCode} from "@emeraldwallet/core";
import {Wei} from "@emeraldplatform/eth";
import {CoinAvatar, WalletReference} from "@emeraldwallet/ui";
import AccountBalance from '../../common/Balance';
import {Address, Page} from "@emeraldplatform/ui";
import {Back} from "@emeraldplatform/ui-icons";

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
            <Grid item={true} xs={1}>
              <CoinAvatar chain={blockchainIdToCode(accountBalance.account.blockchain)}/>
            </Grid>
            <Grid item={true} xs={6}>
              <Address id={accountBalance.account.address?.value || accountBalance.account.id}/>
            </Grid>
            <Grid item={true} xs={4}>
              <AccountBalance
                key={"main"}
                fiatStyle={false}
                balance={accountBalance.balance}
                decimals={4}
                symbol={blockchainIdToCode(accountBalance.account.blockchain).toUpperCase()}
                showFiat={false}
              />
              {accountBalance.tokens.map((token) =>
                <AccountBalance
                  key={"token-" + token.symbol}
                  fiatStyle={false}
                  balance={new Units(token.unitsValue, token.decimals)}
                  decimals={4}
                  symbol={token.symbol}
                  showFiat={false}
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
  balance: Wei;
  tokens: tokens.ITokenBalance[]
}

function acceptAccount(balance: AccountBalance): boolean {
  return balance.balance.isGreaterThan(Wei.ZERO)
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    const wallet = accounts.selectors.findWallet(state, ownProps.walletId)!;
    const allAssets: IBalanceValue[] = accounts.selectors.getWalletBalances(state, wallet, false);
    const balances: AccountBalance[] = wallet.entries.map((account) => {
      let tokenBalances: tokens.ITokenBalance[] = []
      if (isEthereumEntry(account)) {
        tokenBalances = tokens.selectors.selectBalances(state, account.address!.value, blockchainIdToCode(account.blockchain)) || [];
      }
      return {
        account,
        balance: accounts.selectors.getBalance(state, account.id, Wei.ZERO) || Wei.ZERO,
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