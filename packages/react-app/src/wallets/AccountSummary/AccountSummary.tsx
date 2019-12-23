import {WalletOp} from '@emeraldpay/emerald-vault-core';
import * as React from 'react';
import {Grid, StyledComponentProps} from "@material-ui/core";
import {BlockchainCode, blockchainCodeToId} from "@emeraldwallet/core";
import {addresses, settings, State, tokens} from "@emeraldwallet/store";
import {connect} from "react-redux";
import {Wei} from "@emeraldplatform/eth";
import {Balance} from '@emeraldwallet/ui';
import {registry} from "@emeraldwallet/erc20";
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
  assets: BlockchainBalance[],
  total?: BigNumber,
  totalCurrency?: string
}

type DispatchProps = {
}

type BlockchainBalance = {
  balance: Wei | BigNumber,
  token: string,
  decimals: number
}

const AccountSummary = ((props: RenderProps & DispatchProps & StyledComponentProps) => {
  let {assets, total, totalCurrency} = props;
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
          <Balance balance={total} decimals={0} symbol={''} displayDecimals={2}/>
        </Grid>
        <Grid item={true} xs={1}>
          {totalCurrency}
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
              <Balance balance={asset.balance} decimals={asset.decimals} symbol={''} displayDecimals={2}/>
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
    let assets: BlockchainBalance[] = [];
    let ethereumAccounts = wallet.getEthereumAccounts();
    [BlockchainCode.ETH, BlockchainCode.ETC, BlockchainCode.Kovan]
      .forEach((code) => {
        let blockchainAccounts = ethereumAccounts
          .filter((account) => account.blockchain == blockchainCodeToId(code));
        let balance = blockchainAccounts
          .map((account) => addresses.selectors.getBalance(state.addresses, account, Wei.ZERO)!)
          .reduce((a, b) => a.plus(b), Wei.ZERO);
        // show only assets that have at least one address in the wallet
        if (typeof balance !== 'undefined' && blockchainAccounts.length > 0) {
          assets.push({
            token: code.toUpperCase(),
            balance: balance,
            decimals: 18
          })
        }
        let supportedTokens = registry.all()[code];
        if (typeof supportedTokens !== 'undefined') {
          supportedTokens.forEach((token) => {
            blockchainAccounts.forEach((account) => {
              let balance = tokens.selectors.selectBalance(state, token.address, account.address, code);
              if (balance && balance.unitsValue !== '0') {
                assets.push({
                  token: token.symbol,
                  balance: new BigNumber(balance.unitsValue),
                  decimals: balance.decimals
                })
              }
            })
          })
        }
      });

    let allFound = true;
    let total = assets
      .map((asset) => {
        let rate = settings.selectors.fiatRate(asset.token, state);
        if (typeof rate === "undefined") {
          allFound = false;
          return new BigNumber(0);
        } else {
          let base = asset.balance;
          if (!BigNumber.isBigNumber(base)) {
            base = (base as Wei).toWei()
          }
          base = base.dividedBy(new BigNumber(10).pow(asset.decimals));
          let inFiat = base.multipliedBy(rate);
          return inFiat
        }
      })
      .reduce((a, b) => a.plus(b));

    return {
      assets: assets,
      total: allFound ? total : undefined,
      totalCurrency: state.wallet.settings.localeCurrency
    };
  },
  (dispatch, ownProps) => ({
  })
)(AccountSummaryStyled);