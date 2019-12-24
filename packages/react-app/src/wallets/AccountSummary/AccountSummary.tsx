import {WalletOp} from '@emeraldpay/emerald-vault-core';
import * as React from 'react';
import {Grid, StyledComponentProps} from "@material-ui/core";
import {addresses, BalanceValue, settings, State, tokens} from "@emeraldwallet/store";
import {connect} from "react-redux";
import {Wei} from "@emeraldplatform/eth";
import {Balance} from '@emeraldwallet/ui';
import BigNumber from 'bignumber.js';
import {CSSProperties, withStyles} from "@material-ui/styles";

const styles = {
  gridBalance: {
    textAlign: "right",
    paddingRight: "10px"
  } as CSSProperties,
  gridTotal: {
    paddingTop: "10px",
    marginTop: "10px",
    borderTopColor: "#f9f9f9",
    borderTopWidth: "1px",
    borderTopStyle: "solid"
  } as CSSProperties
};

type OwnProps = {
  wallet: WalletOp
}

type RenderProps = {
  assets: BalanceValue[],
  total?: BalanceValue
}

type DispatchProps = {
}

type BlockchainBalance = {
  balance: Wei | BigNumber,
  token: string,
  decimals: number
}

const AccountSummary = ((props: RenderProps & DispatchProps & StyledComponentProps) => {
  let {assets, total} = props;
  let {classes} = props;

  let totalEl = null;
  if (total) {
    totalEl = (
      <Grid container={true} classes={{root: classes!.gridTotal}}>
        <Grid item={true} xs={2}>
        </Grid>
        <Grid item={true} xs={2}>
          Total:
        </Grid>
        <Grid item={true} xs={6} classes={{root: classes!.gridBalance}}>
          <Balance balance={total.balance} symbol={''} displayDecimals={2}/>
        </Grid>
        <Grid item={true} xs={1}>
          {total.token}
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container={true}>
      {assets.map((asset) => {
        return (
          <Grid container={true} key={asset.token}>
            <Grid item={true} xs={4}>
            </Grid>
            <Grid item={true} xs={6} classes={{root: classes!.gridBalance}}>
              <Balance balance={asset.balance} symbol={''} displayDecimals={2}/>
            </Grid>
            <Grid item={true} xs={1}>
              {asset.token}
            </Grid>

          </Grid>
        )
      })}
      {totalEl}
    </Grid>
  );
});

const AccountSummaryStyled = withStyles(styles)(AccountSummary);


export default connect<RenderProps, {}, OwnProps, State>(
  (state, ownProps) => {
    let wallet = ownProps.wallet;
    let assets = addresses.selectors.getWalletBalances(state, wallet, false);
    let total = addresses.selectors.fiatTotalBalance(state, assets);

    return {
      assets,
      total
    };
  },
  (dispatch, ownProps) => ({
  })
)(AccountSummaryStyled);