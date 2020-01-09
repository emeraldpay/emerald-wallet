import {Wei} from "@emeraldplatform/eth";
import {Grid} from "@material-ui/core";
import {Balance, Button, CoinAvatar} from "@emeraldwallet/ui";
import {connect} from "react-redux";
import {addresses, State, screen} from "@emeraldwallet/store";
import {blockchainById, BlockchainCode, blockchainCodeToId} from "@emeraldwallet/core";
import * as React from "react";
import { EthereumAccount } from "@emeraldpay/emerald-vault-core";
import { Account as AddressField, ButtonGroup } from '@emeraldplatform/ui';
import AccountBalance from '../../common/Balance';

type OwnProps = {
  account: EthereumAccount
}

type RenderProps = {
  account: EthereumAccount,
  balance: Wei,
  blockchainCode: BlockchainCode,
}

type DispatchProps = {
  onSendClick: (account: EthereumAccount) => void;
}

const AccountSummary = ((props: RenderProps & DispatchProps) => {
  let {account, balance, blockchainCode} = props;
  let {onSendClick} = props;

  return (
    <Grid container={true}>
      <Grid item={true} xs={5}>
        <AddressField
          identity={false}
          address={account.address}>
        </AddressField>
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
    let {account} = ownProps;
    let blockchainCode = blockchainById(account.blockchain)!.params.code;
    let balance = addresses.selectors.getBalance(state, account, Wei.ZERO) || Wei.ZERO;
    return {
      account,
      balance,
      blockchainCode
    };
  },
  (dispatch, ownProps) => {
    return {
      onSendClick: (account: EthereumAccount) => {
        dispatch(screen.actions.gotoScreen("create-tx", account));
      }
    }
  }
)((AccountSummary));