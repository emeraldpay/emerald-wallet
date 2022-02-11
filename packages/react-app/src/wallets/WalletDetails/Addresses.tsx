import {connect} from "react-redux";
import {Dispatch} from "react";
import * as React from 'react';
import {Box, createStyles, Theme, Grid, TableHead, TableRow, TableCell, TableBody, Table} from "@material-ui/core";
import {accounts, IState, tokens} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import {BlockchainCode, blockchainIdToCode, Blockchains} from "@emeraldwallet/core";
import {Balance, Address} from "@emeraldwallet/ui";
import {isBitcoinEntry, isEthereumEntry, Uuid} from "@emeraldpay/emerald-vault-core";
import {BigAmount} from "@emeraldpay/bigamount";

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
          {addresses.map((address, index) => (
            <TableRow key={`address-${address.address}[${index}]`}>
              <TableCell>{Blockchains[address.blockchain].getTitle()}</TableCell>
              <TableCell><Address address={address.address}/></TableCell>
              <TableCell>
                {address.balances.map((balance) =>
                  <Balance key={"balance-" + balance.units.top.code} balance={balance}/>
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

interface AddressInfo {
  address: string;
  blockchain: BlockchainCode;
  balances: BigAmount[];
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    const wallet = accounts.selectors.findWallet(state, ownProps.walletId)!
    const addresses: AddressInfo[] = [];
    wallet.entries.forEach((account) => {
      let addressValue = "unknown";
      if (isEthereumEntry(account)) {
        if (account.address) {
          addressValue = account.address.value
        }
      } else if (isBitcoinEntry(account)) {
        let receive = account.addresses.find((a) => a.role == "receive")
        if (receive) {
          addressValue = receive.address
        }
      } else {
        console.warn("Invalid account type", account);
        return
      }

      const address: AddressInfo = {
        address: addressValue,
        blockchain: blockchainIdToCode(account.blockchain),
        balances: []
      };

      const zeroBalance = accounts.selectors.zeroAmountFor<BigAmount>(blockchainIdToCode(account.blockchain));
      const balance = accounts.selectors.getBalance(state, account.id, zeroBalance) || zeroBalance;
      address.balances.push(balance);

      (tokens.selectors.selectBalances(state, account.address!.value, blockchainIdToCode(account.blockchain)) || [])
        .filter((unit) => unit.isPositive())
        .forEach((unit) => address.balances.push(unit));

      addresses.push(address);
    })

    return {addresses}
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {}
  }
)((Component));
