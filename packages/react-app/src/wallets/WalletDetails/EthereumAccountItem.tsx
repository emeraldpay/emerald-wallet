import { BigAmount } from "@emeraldpay/bigamount";
import { Wei } from '@emeraldpay/bigamount-crypto';
import { EthereumEntry, WalletEntry } from "@emeraldpay/emerald-vault-core";
import { BlockchainCode, blockchainIdToCode, Blockchains } from '@emeraldwallet/core';
import { accounts, IState, screen, tokens } from '@emeraldwallet/store';
import { CoinAvatar } from '@emeraldwallet/ui';
import { createStyles, Grid, Theme, Typography } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";
import * as React from 'react';
import { Dispatch } from 'react';
import { connect } from 'react-redux';
import AccountBalance from '../../common/Balance';

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    container: {
      border: `0px solid ${theme.palette.divider}`,
      marginBottom: '10px',
    },
    balance: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'end',
    },
    balanceValue: {
      textAlign: 'right',
    },
    balanceSymbol: {
      width: '90px',
      display: 'inline-block',
      textAlign: 'left',
      paddingLeft: '16px',
      opacity: '50%',
    },
  }),
);

/**
 *
 */
const Component = (({tokensBalances, balance, account, blockchainCode, onConvert}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  const blockchain = Blockchains[blockchainCode];

  const accountClasses = {
    root: styles.balance,
    coins: styles.balanceValue,
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
        <Grid item={true} xs={5}>
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
              onConvert={token.units.top.code === 'WETH' ? () => onConvert(account) : undefined}
            />
          )}
        </Grid>
      </Grid>
    </Grid>

  </div>
})

// State Properties
interface Props {
  balance: Wei;
  blockchainCode: BlockchainCode;
  tokensBalances: BigAmount[];
}

// Actions
interface Actions {
  onConvert: (entry: WalletEntry) => void;
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
    return {
      onConvert: (entry: WalletEntry) => {
        dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX_CONVERT, entry))
      },
    }
  }
)((Component));
