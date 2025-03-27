import { BigAmount } from '@emeraldpay/bigamount';
import { Wallet } from '@emeraldpay/emerald-vault-core';
import { IState, accounts, screen } from '@emeraldwallet/store';
import {Balance, HashIcon} from '@emeraldwallet/ui';
import {Button, Card, CardContent, Grid, Typography} from '@mui/material';
import * as React from 'react';
import { connect } from 'react-redux';
import {makeStyles} from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
    root: {
      padding: theme.spacing(),
      margin: '10px 20px',
    },
    walletIcon: {
      cursor: 'pointer',
      paddingLeft: 16,
      paddingTop: 24,
    },
    walletIconImage: {
      display: 'inline-block',
      height: 100,
      width: 100,
    },
    headerAction: {
      width: 'auto',
    },
    totalBalance: {
      fontSize: 20,
      color: theme.palette.text.primary,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      textAlign: 'right',
    },
    title: {
      color: theme.palette.text.primary,
      fontSize: 20,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
    titleLine: {
    },
    balance: {
      color: theme.palette.secondary.main,
      float: 'left',
      marginRight: 10,
    },
    balanceRoot: {
      display: 'inline',
    },
    textBody: {
      width: 400,
    },
    actions: {
      textAlign: 'center',
      clear: 'both',
      marginTop: 20,
      paddingLeft: theme.spacing(3),
    },
    actionButton: {
      width: 150,
      margin: '5px 10px',
    },
}));

interface OwnProps {
  wallet: Wallet;
  openWallet(wallet: Wallet): void;
}

interface StateProps {
  balances: BigAmount[];
  hasAnyBalance: boolean;
  total: BigAmount | undefined;
  walletIcon?: string | null;
}

interface DispatchProps {
  onReceive(event: React.MouseEvent): void;
  onSend(event: React.MouseEvent): void;
}

const WalletItem: React.FC<OwnProps & StateProps & DispatchProps> = ({
  balances,
  hasAnyBalance,
  total,
  wallet,
  walletIcon,
  onReceive,
  onSend,
  openWallet,
}) => {
  const { classes } = useStyles();

  const [current, setCurrent] = React.useState(false);

  const onDetails = React.useCallback(() => {
    if (openWallet) {
      openWallet(wallet);
    }
  }, [wallet, openWallet]);

  return (
    <Card
      variant="elevation"
      elevation={current ? 3 : 0}
      className={classes.root}
      onClick={onDetails}
      onMouseOver={() => setCurrent(true)}
      onMouseOut={() => setCurrent(false)}
    >
      <CardContent>
        <Grid container>
          <Grid item className={classes.walletIcon} xs={2}>
            {walletIcon == null ? (
              <HashIcon value={`WALLET/${wallet.id}`} size={100} />
            ) : (
              <img alt="Wallet Icon" className={classes.walletIconImage} src={`data:image/png;base64,${walletIcon}`} />
            )}
          </Grid>
          <Grid item onClick={onDetails} xs={7}>
            <Grid container>
              <Grid item className={classes.titleLine} xs={8}>
                <Typography className={classes.title}>{wallet.name}</Typography>
              </Grid>
              <Grid item className={classes.titleLine} xs={4}>
                {total?.isPositive() && <Balance classes={{ coin: classes.totalBalance }} balance={total} />}
              </Grid>
              <Grid item xs={12}>
                {balances.map((balance) => (
                  <Balance
                    key={balance.units.top.code}
                    balance={balance}
                    classes={{ coin: classes.balance, root: classes.balanceRoot }}
                  />
                ))}
              </Grid>
            </Grid>
          </Grid>
          <Grid item className={classes.actions} xs={3}>
            <Button
              className={classes.actionButton}
              color="secondary"
              disabled={!hasAnyBalance}
              variant="contained"
              onClick={onSend}
            >
              Send
            </Button>
            <Button className={classes.actionButton} color="secondary" variant="contained" onClick={onReceive}>
              Receive
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { wallet }) => {
    const balances = accounts.selectors.getWalletBalances(state, wallet);

    return {
      balances,
      total: accounts.selectors.fiatTotalBalance(state, balances),
      hasAnyBalance: balances.some((balance) => balance.isPositive()),
      walletIcon: state.accounts.icons[wallet.id],
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, { wallet }) => ({
    getWalletIcon() {
      return dispatch(accounts.actions.getWalletIcon(wallet.id));
    },
    onReceive(event) {
      event.stopPropagation();

      dispatch(screen.actions.gotoScreen(screen.Pages.RECEIVE, wallet.id));
    },
    onSend(event) {
      event.stopPropagation();

      dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX, { walletId: wallet.id }, null, true));
    },
  }),
)(WalletItem);
