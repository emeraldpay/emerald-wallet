import {
  Button,
  Card,
  CardContent,
  Grid,
  Theme,
  Typography
} from '@material-ui/core';
import {createStyles, makeStyles} from '@material-ui/core/styles';
import * as React from 'react';
import {Balance} from "@emeraldwallet/ui";
import {connect} from "react-redux";
import {accounts, IBalanceValue, IState, screen} from "@emeraldwallet/store";
import {Dispatch} from "react";
import {Hashicon} from "@emeraldpay/hashicon-react";
import {Wallet} from '@emeraldpay/emerald-vault-core';

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    root: {
      width: "100%",
      padding: theme.spacing(),
      marginTop: theme.spacing(),
    },
    walletIcon: {
      cursor: 'pointer',
      paddingLeft: "16px",
      paddingTop: "24px",
    },
    headerAction: {
      width: "auto"
    },
    totalBalance: {
      fontSize: "20px",
      // @ts-ignore
      color: theme.emeraldColors.coal,
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      textAlign: "right",
    },
    title: {
      // @ts-ignore
      color: theme.emeraldColors.coal,
      fontSize: "20px",
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
    },
    titleLine: {
      paddingTop: "24px",
      paddingBottom: "16px",
    },
    balance: {
      color: theme.palette.secondary.main,
      float: "left",
      paddingRight: "10px",
    },
    balanceRoot: {
      display: "inline",
    },
    textBody: {
      width: "400px"
    },
    actions: {
      textAlign: "center",
      clear: "both",
      marginTop: "20px",
      paddingLeft: theme.spacing(3)
    },
    actionButton: {
      width: "150px",
      margin: "5px 10px",
    }
  })
);

/**
 *
 */
const WalletItem = (({wallet, openWallet, assets, total, onReceive, onSend}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  const [current, setCurrent] = React.useState(false)

  function handleDetailsClick() {
    if (openWallet) {
      openWallet(wallet);
    }
  }

  return (
    <Card variant={"elevation"}
          elevation={current ? 3 : 0}
          className={styles.root}
          onMouseOver={() => setCurrent(true)}
          onMouseOut={() => setCurrent(false)}>
      <CardContent>
        <Grid container={true}>
          <Grid item={true} xs={2} className={styles.walletIcon} onClick={handleDetailsClick}>
            <Hashicon value={"WALLET/" + wallet.id} size={100}/>
          </Grid>
          <Grid item={true} xs={7} onClick={handleDetailsClick}>
            <Grid container={true}>
              <Grid item={true} xs={8} className={styles.titleLine}>
                <Typography className={styles.title}>{wallet.name}</Typography>
              </Grid>
              <Grid item={true} xs={4} className={styles.titleLine}>
                {total && <Balance classes={{coins: styles.totalBalance}}
                                   balance={total.balance}/>}
              </Grid>
              <Grid item={true} xs={12}>
                {assets.map((asset) => (
                  <Balance key={asset.balance.units.top.code}
                           balance={asset.balance}
                           classes={{coins: styles.balance, root: styles.balanceRoot}}/>
                  )
                )}
              </Grid>
            </Grid>
          </Grid>
          <Grid item={true} xs={3} className={styles.actions}>
            <Button variant={"contained"}
                    onClick={onSend}
                    className={styles.actionButton}
                    color={"secondary"}>Send</Button>
            <Button variant={"contained"}
                    onClick={onReceive}
                    className={styles.actionButton}
                    color={"secondary"}>Receive</Button>
          </Grid>
        </Grid>
      </CardContent>

    </Card>

  )
})

// State Properties
interface Props {
  total: IBalanceValue | undefined,
  assets: IBalanceValue[]
}

// Actions
interface Actions {
  onReceive: () => void;
  onSend: () => void;
}

// Component properties
interface OwnProps {
  wallet: Wallet;
  openWallet: (wallet: Wallet) => void;
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    const assets: IBalanceValue[] = accounts.selectors.getWalletBalances(state, ownProps.wallet, false);
    const total: IBalanceValue | undefined = accounts.selectors.fiatTotalBalance(state, assets);

    return {
      total, assets
    }
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {
      onReceive: () => {
        dispatch(screen.actions.gotoScreen(screen.Pages.RECEIVE, ownProps.wallet.id))
      },
      onSend: () => {
        dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX, ownProps.wallet.id))
      }
    }
  }
)((WalletItem));
