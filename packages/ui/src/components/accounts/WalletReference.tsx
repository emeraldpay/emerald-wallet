import {makeStyles} from '@material-ui/core/styles';
import * as React from 'react';
import {Box, Card, CardContent, CardMedia, createStyles, Grid, Theme, Typography} from "@material-ui/core";
import {ClassNameMap} from "@material-ui/styles";
import {WithDefaults, CurrencyCode, AnyCoinCode} from "@emeraldwallet/core";
import {Hashicon} from "@emeraldpay/hashicon-react";
import {Balance} from "../../index";
import classNames from "classnames";
import {Wallet} from '@emeraldpay/emerald-vault-core';
import {BigAmount} from "@emeraldpay/bigamount";

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    avatar: {
      paddingTop: "18px",
      paddingLeft: "16px",
    },
    content: {},
    walletId: {
      fontSize: "0.8em",
      opacity: "0.75",
    },
    balanceList: {
      paddingTop: theme.spacing(1),
    },
    balance: {
      color: theme.palette.secondary.main,
      float: "left",
      paddingRight: "10px",
      fontSize: "0.9em",
    },
    balanceRoot: {
      display: "inline",
    },
  })
);

// Component properties
interface OwnProps {
  wallet: Wallet;
  assets: {
    balance: BigAmount;
  }[];
  classes?: Partial<ClassNameMap<ClassKey>>;
}

const defaults: Partial<OwnProps> = {
  classes: {}
}

type ClassKey = 'root' | 'content';

/**
 *
 */
const Component = ((props: OwnProps) => {
  props = WithDefaults(props, defaults);
  const styles = useStyles();
  const {classes, wallet, assets} = props;

  return <Card className={classNames(styles.root, classes.root)} elevation={0}>
    <CardMedia className={styles.avatar}>
      <Hashicon value={"WALLET/" + wallet.id} size={80}/>
    </CardMedia>
    <CardContent className={classNames(styles.content, classes.content)}>
      <Typography>{wallet.name || '--'}</Typography>
      <Typography variant={"body2"} className={styles.walletId}>{wallet.id}</Typography>
      <Box className={styles.balanceList}>
        {assets.map((asset) => (
          <Balance key={"balance-" + asset.balance.units.top.code}
                   balance={asset.balance}
                   classes={{coins: styles.balance, root: styles.balanceRoot}}/>
          )
        )}
      </Box>
    </CardContent>
  </Card>
})

export default Component;