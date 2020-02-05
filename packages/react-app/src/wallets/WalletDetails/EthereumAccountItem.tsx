import { Wei } from '@emeraldplatform/eth';
import { Account as AddressField, ButtonGroup } from '@emeraldplatform/ui';
import { Account } from '@emeraldwallet/core';
import { addresses, IState, screen, tokens } from '@emeraldwallet/store';
import { Balance, Button, CoinAvatar } from '@emeraldwallet/ui';
import { Grid } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import AccountBalance from '../../common/Balance';
import TokenBalances from '../TokenBalances';

interface IOwnProps {
  account: Account;
}

interface IRenderProps {
  account: Account;
  tokensBalances: any[];
  balance: Wei;
}

interface IDispatchProps {
  onSendClick?: (account: Account) => void;
}

export const EthereumAccountItem = ((props: IRenderProps & IDispatchProps) => {
  const { account, balance, tokensBalances } = props;
  const blockchainCode = account.blockchain;
  const { onSendClick } = props;

  function handleSendClick () {
    if (onSendClick) {
      onSendClick(account);
    }
  }

  return (
    <React.Fragment>

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
          <Grid item={true} xs={3}>
            {/*<Button*/}
            {/*  label='Deposit'*/}
            {/*  // onClick={this.handleDepositClick}*/}
            {/*/>*/}
            <Button
              label='Send'
              disabled={balance.isZero()}
              onClick={handleSendClick}
            />
          </Grid>
        </Grid>
        <Grid item={true}><TokenBalances balances={tokensBalances} /></Grid>
      </Grid>

    </React.Fragment>
  );
});

export default connect<IRenderProps, IDispatchProps, IOwnProps, IState>(
  (state: IState, ownProps: IOwnProps) => {
    const { account } = ownProps;
    const blockchainCode = account.blockchain;
    const balance = addresses.selectors.getBalance(state, account.id, Wei.ZERO) || Wei.ZERO;
    const tokensBalances = tokens.selectors.selectBalances(state, account.address!, blockchainCode);
    return {
      account,
      balance,
      blockchainCode,
      tokensBalances
    };
  },
  (dispatch, ownProps) => {
    return {
      onSendClick: (account: Account) => {
        dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX, account));
      }
    };
  }
)((EthereumAccountItem));
