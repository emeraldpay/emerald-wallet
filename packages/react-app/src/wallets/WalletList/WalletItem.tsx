import { BigAmount } from '@emeraldpay/bigamount';
import { Wallet } from '@emeraldpay/emerald-vault-core';
import { IState, accounts, screen } from '@emeraldwallet/store';
import { Balance, HashIcon } from '@emeraldwallet/ui';
import { Button, Card, CardContent, Grid, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { connect } from 'react-redux';

const useStyles = makeStyles((theme) =>
  createStyles({
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
      paddingTop: 24,
      paddingBottom: 16,
    },
    balance: {
      color: theme.palette.secondary.main,
      float: 'left',
      paddingRight: 10,
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
  }),
);

interface OwnProps {
  wallet: Wallet;
  openWallet(wallet: Wallet): void;
}

interface StateProps {
  balances: BigAmount[];
  total: BigAmount | undefined;
  walletIcon?: string | null;
}

interface DispatchProps {
  onReceive(event: React.MouseEvent): void;
  onSend(event: React.MouseEvent): void;
}

const WalletItem: React.FC<OwnProps & StateProps & DispatchProps> = ({
  balances,
  total,
  wallet,
  walletIcon,
  onReceive,
  onSend,
  openWallet,
}) => {
  const styles = useStyles();

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
      className={styles.root}
      onClick={onDetails}
      onMouseOver={() => setCurrent(true)}
      onMouseOut={() => setCurrent(false)}
    >
      <CardContent>
        <Grid container>
          <Grid item className={styles.walletIcon} xs={2}>
            {walletIcon == null ? (
              <HashIcon value={`WALLET/${wallet.id}`} size={100} />
            ) : (
              <img alt="Wallet Icon" className={styles.walletIconImage} src={`data:image/png;base64,${walletIcon}`} />
            )}
          </Grid>
          <Grid item onClick={onDetails} xs={7}>
            <Grid container>
              <Grid item className={styles.titleLine} xs={8}>
                <Typography className={styles.title}>{wallet.name}</Typography>
              </Grid>
              <Grid item className={styles.titleLine} xs={4}>
                {total?.isPositive() && <Balance classes={{ coin: styles.totalBalance }} balance={total} />}
              </Grid>
              <Grid item xs={12}>
                {balances.map((balance) => (
                  <Balance
                    key={balance.units.top.code}
                    balance={balance}
                    classes={{ coin: styles.balance, root: styles.balanceRoot }}
                  />
                ))}
              </Grid>
            </Grid>
          </Grid>
          <Grid item className={styles.actions} xs={3}>
            <Button className={styles.actionButton} color="secondary" variant="contained" onClick={onSend}>
              Send
            </Button>
            <Button className={styles.actionButton} color="secondary" variant="contained" onClick={onReceive}>
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
    const total = accounts.selectors.fiatTotalBalance(state, balances);

    return { balances, total, walletIcon: state.accounts.icons[wallet.id] };
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

      dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX, wallet.id, null, true));
    },
  }),
)(WalletItem);
