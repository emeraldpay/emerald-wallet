import {Blockchains, Units, Wallet} from '@emeraldwallet/core';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  GridSize,
  Theme,
  Typography
} from '@material-ui/core';
import {createStyles, makeStyles, withStyles, withTheme} from '@material-ui/core/styles';
import {AccountBalanceWalletOutlined as WalletIcon} from '@material-ui/icons';
import * as React from 'react';
import {Balance} from "@emeraldwallet/ui";
import {connect} from "react-redux";
import {accounts, IBalanceValue, IState} from "@emeraldwallet/store";
import {Dispatch} from "react";
import {Block} from "@emeraldplatform/ui-icons"
import {Wei} from "@emeraldplatform/eth";

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    root: {
      width: "100%",
      padding: theme.spacing(),
      marginTop: theme.spacing(),
    },
    gridCardInner: {
      // @ts-ignore
      backgroundColor: theme.emeraldColors.white.main,
      margin: '10px',
      width: '100%',
      border: `1px solid ${theme.palette.divider}`,
    },
    walletIcon: {
      cursor: 'pointer'
    },
    headerAction: {
      width: "auto"
    },
    totalBalance: {
      fontSize: "3.8em",
      color: theme.palette.primary.main,
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
    },
    title: {
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
    },
    balance: {
      color: theme.palette.secondary.main,
      textAlign: "right",
    },
    textIcon: {
      float: "left",
      width: "34px"
    },
    textBody: {
      width: "400px"
    },
    actions: {
      clear: "both",
      marginTop: "20px",
      paddingLeft: theme.spacing(3)
    },
  })
);

function balanceLength(value: Units | Wei): number {
  if (Units.isUnits(value)) {
    return value.toString().length + 3;
  }
  return value.toString(undefined, 2, false, true).length
}

/**
 *
 */
const Component = (({wallet, openWallet, assets, total}: Props & Actions & OwnProps) => {
  const styles = useStyles();

  function handleDetailsClick() {
    if (openWallet) {
      openWallet(wallet);
    }
  }

  return (
    <Card variant={"outlined"} className={styles.root}>
      <CardContent>
        <Grid
          item={true}
          xs={12}
        >
          <Grid container={true}>
            <Grid item={true} xs={6}>
              <Typography variant={"h4"} className={styles.title}>
                <WalletIcon color='secondary'/>
                {wallet.name}
              </Typography>
              <Box>
                <Block className={styles.textIcon}/>
                <Typography className={styles.textBody}>
                  {wallet.accounts.map((acc) =>
                    Blockchains[acc.blockchain].getTitle()
                  ).join(", ")}
                </Typography>
              </Box>
              <Box className={styles.actions}>
                <Button variant={"outlined"}
                        onClick={handleDetailsClick}
                        color={"primary"}>Wallet Details</Button>
              </Box>
            </Grid>
            <Grid item={true} xs={6}>
              <Grid container={true}>
                <Grid item={true} xs={12}>
                  {total && <Balance classes={{coins: styles.totalBalance}}
                                     balance={total.balance}
                                     symbol={total.token}
                                     displayDecimals={2}/>}
                </Grid>
                {assets.map((asset) => {
                  const l = balanceLength(asset.balance);
                  let xs = 3;
                  if (l > 6) xs = xs + 1;
                  return (
                    <Grid item={true} xs={xs as GridSize} key={asset.token}>
                      <Balance balance={asset.balance} symbol={asset.token} displayDecimals={2}
                               classes={{coins: styles.balance}}/>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
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
    return {}
  }
)((Component));
