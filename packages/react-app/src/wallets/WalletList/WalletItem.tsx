import { Wallet } from '@emeraldpay/emerald-vault-core';
import { IBalanceValue, IState, accounts, screen } from '@emeraldwallet/store';
import { Balance, HashIcon, Theme } from '@emeraldwallet/ui';
import { Button, Card, CardContent, Grid, Typography } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { connect } from 'react-redux';

const useStyles = makeStyles<typeof Theme>((theme) =>
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
  total: IBalanceValue | undefined;
  assets: IBalanceValue[];
}

interface DispatchProps {
  onReceive: () => void;
  onSend: () => void;
}

const WalletItem: React.FC<OwnProps & StateProps & DispatchProps> = ({
  assets,
  total,
  wallet,
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
      variant={'elevation'}
      elevation={current ? 3 : 0}
      className={styles.root}
      onMouseOver={() => setCurrent(true)}
      onMouseOut={() => setCurrent(false)}
    >
      <CardContent>
        <Grid container={true}>
          <Grid item={true} xs={2} className={styles.walletIcon} onClick={onDetails}>
            <HashIcon value={'WALLET/' + wallet.id} size={100} />
          </Grid>
          <Grid item={true} xs={7} onClick={onDetails}>
            <Grid container={true}>
              <Grid item={true} xs={8} className={styles.titleLine}>
                <Typography className={styles.title}>{wallet.name}</Typography>
              </Grid>
              <Grid item={true} xs={4} className={styles.titleLine}>
                {total && <Balance classes={{ coins: styles.totalBalance }} balance={total.balance} />}
              </Grid>
              <Grid item={true} xs={12}>
                {assets.map((asset) => (
                  <Balance
                    key={asset.balance.units.top.code}
                    balance={asset.balance}
                    classes={{ coins: styles.balance, root: styles.balanceRoot }}
                  />
                ))}
              </Grid>
            </Grid>
          </Grid>
          <Grid item={true} xs={3} className={styles.actions}>
            <Button variant={'contained'} onClick={onSend} className={styles.actionButton} color={'secondary'}>
              Send
            </Button>
            <Button variant={'contained'} onClick={onReceive} className={styles.actionButton} color={'secondary'}>
              Receive
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, ownProps) => {
    const assets: IBalanceValue[] = accounts.selectors.getWalletBalances(state, ownProps.wallet, false);
    const total: IBalanceValue | undefined = accounts.selectors.fiatTotalBalance(state, assets);

    return { total, assets };
  },
  (dispatch, ownProps) => ({
    onReceive() {
      dispatch(screen.actions.gotoScreen(screen.Pages.RECEIVE, ownProps.wallet.id));
    },
    onSend() {
      dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX, ownProps.wallet.id));
    },
  }),
)(WalletItem);
