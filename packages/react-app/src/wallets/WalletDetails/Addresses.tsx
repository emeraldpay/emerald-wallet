import {connect} from "react-redux";
import {Dispatch} from "react";
import * as React from 'react';
import {Box, createStyles, Theme, Grid, TableHead, TableRow, TableCell, TableBody, Table} from "@material-ui/core";
import {accounts, IState, tokens} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import {Unit, Wei} from "@emeraldplatform/eth";
import {BlockchainCode, blockchainIdToCode, Blockchains, Units} from "@emeraldwallet/core";
import {Balance} from "@emeraldwallet/ui";
import {Address} from '@emeraldplatform/ui';
import {Uuid} from "@emeraldpay/emerald-vault-core";

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    root: {
      padding: '30px 30px 20px',
      backgroundColor: 'white',
      border: `1px solid ${theme.palette.divider}`
    }
  })
);

/**
 *
 */
const Component = (({addresses}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  return <Grid container={true} className={styles.root}>
    <Grid item={true} xs={12}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Blockchain</TableCell>
            <TableCell>Address</TableCell>
            <TableCell>Balance</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {addresses.map((address) => (
            <TableRow key={"address-" + address.address}>
              <TableCell>{Blockchains[address.blockchain].getTitle()}</TableCell>
              <TableCell><Address id={address.address}/></TableCell>
              <TableCell>
                {address.balances.map((asset) =>
                  <Balance key={"balance-" + asset.token}
                           balance={asset.balance}
                           symbol={asset.token}
                           displayDecimals={2}/>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Grid>
  </Grid>
})

// State Properties
interface Props {
  addresses: AddressInfo[];
}

// Actions
interface Actions {
}

// Component properties
interface OwnProps {
  walletId: Uuid
}

interface AnyBalance {
  balance: Wei | Units;
  token: string;
}

interface AddressInfo {
  address: string;
  blockchain: BlockchainCode;
  balances: AnyBalance[];
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    const wallet = accounts.selectors.findWallet(state, ownProps.walletId)!
    const addresses: AddressInfo[] = [];
    wallet.entries.forEach((account) => {
      const address: AddressInfo = {
        address: account.address?.value || "unknown",
        blockchain: blockchainIdToCode(account.blockchain),
        balances: []
      };
      const balance = accounts.selectors.getBalance(state, account.id, Wei.ZERO) || Wei.ZERO;
      address.balances.push({balance, token: address.blockchain.toUpperCase()});
      (tokens.selectors.selectBalances(state, account.address!.value, blockchainIdToCode(account.blockchain)) || [])
        .map((token) => {
          return {balance: new Units(token.unitsValue, token.decimals), token: token.symbol}
        })
        .filter((unit) => unit.balance.toBigNumber().isPositive())
        .forEach((unit) => address.balances.push(unit));

      addresses.push(address);
    })

    return {addresses}
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {}
  }
)((Component));