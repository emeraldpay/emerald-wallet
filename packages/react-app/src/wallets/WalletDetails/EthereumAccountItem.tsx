import { Wei } from '@emeraldplatform/eth';
import { Account as AddressField, ButtonGroup } from '@emeraldplatform/ui';
import { Account } from '@emeraldwallet/core';
import { accounts, IState, screen, tokens } from '@emeraldwallet/store';
import { Balance, Button, CoinAvatar } from '@emeraldwallet/ui';
import { Grid, withStyles } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import AccountBalance from '../../common/Balance';
import AccountActions from '../AccountActions';
import TokenBalances from '../TokenBalances';

const styles = (theme: any) => ({
  container: {
    border: `0px solid ${theme.palette.divider}`,
    marginBottom: '10px'
  }
});

interface IOwnProps {
  account: Account;
  walletId: string;
}

interface IRenderProps {
  walletId: string;
  account: Account;
  tokensBalances: any[];
  balance: Wei;
  classes: any;
}

interface IDispatchProps {
  onSendClick?: (account: Account) => void;
}

export const EthereumAccountItem = ((props: IRenderProps & IDispatchProps) => {
  const { account, balance, tokensBalances, classes } = props;
  const blockchainCode = account.blockchain;
  const { onSendClick } = props;

  function handleSendClick () {
    if (onSendClick) {
      onSendClick(account);
    }
  }

  return (
    <div className={classes.container}>

      <Grid container={true} direction={'column'} alignItems={'stretch'}>
        <Grid container={true} alignItems={'center'}>
          <Grid item={true} xs={1}>
            <CoinAvatar chain={blockchainCode} />
          </Grid>
          <Grid item={true} xs={5}>
            <AddressField
              identity={false}
              address={account.address!}
            />
          </Grid>
          <Grid item={true} xs={3}>
            <AccountBalance
              fiatStyle={false}
              balance={balance}
              decimals={6}
              symbol={blockchainCode.toUpperCase()}
              showFiat={false}
            />
          </Grid>
          <Grid item={true} xs={3} container={true} alignItems={'center'} >
            <ButtonGroup>
              <Button
                label='Deposit'
                // onClick={this.handleDepositClick}
              />
              <Button
                label='Send'
                disabled={balance.isZero()}
                onClick={handleSendClick}
              />
              <AccountActions account={account} />
            </ButtonGroup>
          </Grid>
        </Grid>
        <Grid container={true}>
          <Grid item={true} xs={1}>
          </Grid>
          <Grid item={true} xs={5}>
            <TokenBalances balances={tokensBalances} />
          </Grid>
        </Grid>
      </Grid>

    </div>
  );
});

const styled = withStyles(styles)(EthereumAccountItem);

export default connect<IRenderProps, IDispatchProps, IOwnProps, IState>(
  (state: IState, ownProps: IOwnProps): any => {
    const { account } = ownProps;
    const blockchainCode = account.blockchain;
    const balance = accounts.selectors.getBalance(state, account.id, Wei.ZERO) || Wei.ZERO;
    const tokensBalances = tokens.selectors.selectBalances(state, account.address!, blockchainCode);
    return {
      walletId: ownProps.walletId,
      account,
      balance,
      blockchainCode,
      tokensBalances
    };
  },
  (dispatch: any) => {
    return {
      onSendClick: (account: Account) => {
        dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX, account));
      }
    };
  }
)((styled));
