import { Wallet } from '@emeraldpay/emerald-vault-core';
import { Wei } from '@emeraldplatform/eth';
import { addresses, IBalanceValue, IState, settings, tokens } from '@emeraldwallet/store';
import { Balance } from '@emeraldwallet/ui';
import { Grid, StyledComponentProps } from '@material-ui/core';
import { createStyles, withStyles } from '@material-ui/core/styles';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import { connect } from 'react-redux';

const styles = createStyles({
  gridBalance: {
    textAlign: 'right',
    paddingRight: '10px'
  },
  gridTotal: {
    paddingTop: '10px',
    marginTop: '10px',
    borderTopColor: '#f9f9f9',
    borderTopWidth: '1px',
    borderTopStyle: 'solid'
  }
});

interface IOwnProps {
  wallet: Wallet;
}

interface RenderProps {
  assets: IBalanceValue[];
  total?: IBalanceValue;
}

interface DispatchProps {
}

interface BlockchainBalance {
  balance: Wei | BigNumber;
  token: string;
  decimals: number;
}

const WalletSummary = ((props: RenderProps & DispatchProps & StyledComponentProps) => {
  const { assets, total } = props;
  const { classes } = props;

  let totalEl = null;
  if (total) {
    totalEl = (
      <Grid container={true} classes={{ root: classes!.gridTotal }}>
        <Grid item={true} xs={2}/>
        <Grid item={true} xs={2}>
          Total:
        </Grid>
        <Grid item={true} xs={6} classes={{ root: classes!.gridBalance }}>
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
            <Grid item={true} xs={4}/>
            <Grid item={true} xs={6} classes={{ root: classes!.gridBalance }}>
              <Balance balance={asset.balance} symbol={''} displayDecimals={2}/>
            </Grid>
            <Grid item={true} xs={1}>
              {asset.token}
            </Grid>
          </Grid>
        );
      })}
      {totalEl}
    </Grid>
  );
});

const SummaryStyled = withStyles(styles)(WalletSummary);

export default connect<RenderProps, {}, IOwnProps, IState>(
  (state: IState, ownProps) => {
    const wallet = ownProps.wallet;
    const assets: IBalanceValue[] = addresses.selectors.getWalletBalances(state, wallet, false);
    const total: IBalanceValue | undefined = addresses.selectors.fiatTotalBalance(state, assets);

    return {
      assets,
      total
    };
  },
  (dispatch, ownProps) => ({
  })
)(SummaryStyled);
