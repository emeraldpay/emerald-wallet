import {BlockchainCode, blockchainIdToCode, Blockchains} from '@emeraldwallet/core';
import {accounts, IState, screen, tokens} from '@emeraldwallet/store';
import {Button, CoinAvatar} from '@emeraldwallet/ui';
import {Box, createStyles, Grid, Theme, Typography, withStyles} from '@material-ui/core';
import * as React from 'react';
import {connect} from 'react-redux';
import AccountBalance from '../../common/Balance';
import {makeStyles} from "@material-ui/core/styles";
import {Dispatch} from "react";
import {EthereumEntry} from "@emeraldpay/emerald-vault-core";
import {Wei} from '@emeraldpay/bigamount-crypto';
import {BigAmount} from "@emeraldpay/bigamount";

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    container: {
      border: `0px solid ${theme.palette.divider}`,
      marginBottom: '10px'
    },
    balanceValue: {
      textAlign: "right",
    },
    balanceSymbol: {
      width: "40px",
      display: "inline-block",
      textAlign: "left",
      paddingLeft: "16px",
      opacity: "50%"
    }
  })
);

/**
 *
 */
const Component = (({tokensBalances, balance, blockchainCode}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  const blockchain = Blockchains[blockchainCode];

  const accountClasses = {
    root: styles.balanceValue,
    coinSymbol: styles.balanceSymbol,
  };

  return <div className={styles.container}>
    <Grid container={true}>
      <Grid container={true}>
        <Grid item={true} xs={1}>
          <CoinAvatar chain={blockchainCode}/>
        </Grid>
        <Grid item={true} xs={6}>
          <Typography>{blockchain.getTitle()}</Typography>
        </Grid>
        <Grid item={true} xs={4}>
          <AccountBalance
            key={"main"}
            classes={accountClasses}
            balance={balance}
          />
          {tokensBalances.map((token) =>
            <AccountBalance
              key={"token-" + token.units.top.code}
              classes={accountClasses}
              balance={token}
            />
          )}
        </Grid>
      </Grid>
    </Grid>

  </div>
})

// State Properties
interface Props {
  tokensBalances: BigAmount[];
  balance: Wei;
  blockchainCode: BlockchainCode
}

// Actions
interface Actions {
}

// Component properties
interface OwnProps {
  account: EthereumEntry;
  walletId: string;
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    const {account} = ownProps;
    const blockchainCode = blockchainIdToCode(account.blockchain);
    const balance = accounts.selectors.getBalance(state, account.id, Wei.ZERO) || Wei.ZERO;
    const tokensBalances = tokens.selectors.selectBalances(state, account.address!.value, blockchainCode) || [];

    return {
      tokensBalances,
      balance,
      blockchainCode
    }
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {}
  }
)((Component));
