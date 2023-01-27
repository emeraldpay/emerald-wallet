import { BigAmount } from '@emeraldpay/bigamount';
import { Wallet } from '@emeraldpay/emerald-vault-core';
import { Box, Card, CardContent, CardMedia, Typography, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/styles';
import classNames from 'classnames';
import * as React from 'react';
import { Balance, HashIcon } from '../../index';

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    avatar: {
      paddingTop: 18,
      paddingLeft: 16,
    },
    walletId: {
      fontSize: '0.8em',
      opacity: '0.75',
    },
    balances: {
      paddingTop: theme.spacing(1),
    },
    balance: {
      display: 'inline',
    },
    coin: {
      color: theme.palette.secondary.main,
      float: 'left',
      fontSize: '0.9em',
      paddingRight: 10,
    },
  }),
);

type Asset = { balance: BigAmount };

interface OwnProps {
  assets: Asset[];
  classes?: Partial<ClassNameMap<'root' | 'content'>>;
  wallet: Wallet;
}

const WalletReference: React.FC<OwnProps> = ({ assets, wallet, classes = {} }) => {
  const styles = useStyles();

  return (
    <Card className={classNames(styles.root, classes.root)} elevation={0}>
      <CardMedia className={styles.avatar}>
        <HashIcon value={`WALLET/${wallet.id}`} size={80} />
      </CardMedia>
      <CardContent className={classes.content}>
        <Typography>{wallet.name ?? '--'}</Typography>
        <Typography variant="body2" className={styles.walletId}>
          {wallet.id}
        </Typography>
        <Box className={styles.balances}>
          {assets.map((asset) => (
            <Balance
              key={`balance-${asset.balance.units.top.code}`}
              balance={asset.balance}
              classes={{ root: styles.balance, coin: styles.coin }}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default WalletReference;
