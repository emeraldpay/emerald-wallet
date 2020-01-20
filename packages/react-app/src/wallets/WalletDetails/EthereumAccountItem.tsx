import { EthereumAccount } from '@emeraldpay/emerald-vault-core';
import { Wei } from '@emeraldplatform/eth';
import { Account as AddressField, ButtonGroup } from '@emeraldplatform/ui';
import { blockchainById, BlockchainCode, blockchainCodeToId } from '@emeraldwallet/core';
import { addresses, screen, State } from '@emeraldwallet/store';
import { Balance, Button, CoinAvatar } from '@emeraldwallet/ui';
import { Grid } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import AccountBalance from '../../common/Balance';

interface OwnProps {
  account: EthereumAccount;
}

interface RenderProps {
  account: EthereumAccount;
  balance: Wei;
  blockchainCode: BlockchainCode;
}

interface DispatchProps {
  onSendClick: (account: EthereumAccount) => void;
}

const AccountSummary = ((props: RenderProps & DispatchProps) => {
  const { account, balance, blockchainCode } = props;
  const { onSendClick } = props;

  return (
    <Grid container={true}>
      <Grid item={true} xs={5}>
        <AddressField
          identity={false}
          address={account.address}/>
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
        {/*<Button*/}
        {/*  label='Send'*/}
        {/*  disabled={balance.isZero()}*/}
        {/*  onClick={onSendClick}*/}
        {/*/>*/}
      </Grid>
    </Grid>
  );
});

export default connect<RenderProps, DispatchProps, OwnProps, State>(
  (state, ownProps) => {
    const { account } = ownProps;
    const blockchainCode = blockchainById(account.blockchain)!.params.code;
    const balance = addresses.selectors.getBalance(state, account, Wei.ZERO) || Wei.ZERO;
    return {
      account,
      balance,
      blockchainCode
    };
  },
  (dispatch, ownProps) => {
    return {
      onSendClick: (account: EthereumAccount) => {
        dispatch(screen.actions.gotoScreen('create-tx', account));
      }
    };
  }
)((AccountSummary));
