import { Wallet } from '@emeraldwallet/core';
import { accounts, IBalanceValue, IState, settings, tokens } from '@emeraldwallet/store';
import { Balance } from '@emeraldwallet/ui';
import { Grid, StyledComponentProps, withTheme } from '@material-ui/core';
import { createStyles, withStyles } from '@material-ui/core/styles';
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

interface IRenderProps {
  assets: IBalanceValue[];
  total?: IBalanceValue;
  theme?: any;
}

// interface BlockchainBalance {
//   balance: Wei | BigNumber;
//   token: string;
//   decimals: number;
// }

const WalletSummary = ((props: IRenderProps & StyledComponentProps) => {
  const { assets, total, classes, theme } = props;

  const fiatStyle = {
    fontSize: '16px',
    lineHeight: '19px',
    color: theme?.palette.text.secondary
  };

  let totalEl = null;
  if (total) {
    totalEl = (
      <Grid container={true} classes={{ root: classes!.gridTotal }}>
        <Grid item={true} xs={2}/>
        <Grid item={true} xs={2}>
          Total:
        </Grid>
        <Grid item={true} xs={6} classes={{ root: classes!.gridBalance }}>
          <Balance fiatStyle={fiatStyle} balance={total.balance} symbol={''} displayDecimals={2}/>
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

const SummaryStyled = withTheme(withStyles(styles)(WalletSummary));

export default connect<IRenderProps, {}, IOwnProps, IState>(
  (state: IState, ownProps) => {
    const wallet = ownProps.wallet;
    const assets: IBalanceValue[] = accounts.selectors.getWalletBalances(state, wallet, false);
    const total: IBalanceValue | undefined = accounts.selectors.fiatTotalBalance(state, assets);

    return {
      assets,
      total
    };
  },
  (dispatch, ownProps) => ({
  })
)(SummaryStyled);
