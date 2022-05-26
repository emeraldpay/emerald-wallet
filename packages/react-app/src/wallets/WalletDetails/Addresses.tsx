import { BigAmount } from '@emeraldpay/bigamount';
import { isBitcoinEntry, isEthereumEntry, Uuid } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, blockchainIdToCode, Blockchains } from '@emeraldwallet/core';
import { accounts, IState, tokens } from '@emeraldwallet/store';
import { Address, Balance } from '@emeraldwallet/ui';
import { createStyles, Grid, Table, TableBody, TableCell, TableHead, TableRow, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { connect } from 'react-redux';

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    root: {
      padding: '30px 30px 20px',
      backgroundColor: 'white',
      border: `1px solid ${theme.palette.divider}`,
    },
  }),
);

interface OwnProps {
  walletId: Uuid;
}

interface StateProps {
  addresses: AddressInfo[];
}

interface AddressInfo {
  address: string;
  balances: BigAmount[];
  blockchain: BlockchainCode;
}

const Addresses: React.FC<StateProps & OwnProps> = ({ addresses }) => {
  const styles = useStyles();

  return (
    <Grid container={true} className={styles.root}>
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
                <TableCell>
                  <Address address={address.address} />
                </TableCell>
                <TableCell>
                  {address.balances.map((balance) => (
                    <Balance key={'balance-' + balance.units.top.code} balance={balance} />
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  );
};

export default connect<StateProps, {}, OwnProps, IState>((state, ownProps) => {
  const wallet = accounts.selectors.findWallet(state, ownProps.walletId);

  const addresses: AddressInfo[] = [];

  wallet?.entries
    .filter((entry) => !entry.receiveDisabled)
    .forEach((account) => {
      let addressValue: string | undefined;

      if (isEthereumEntry(account)) {
        addressValue = account.address?.value;
      } else if (isBitcoinEntry(account)) {
        addressValue = account.addresses.find((address) => address.role === 'receive')?.address;
      }

      if (addressValue == null) {
        return;
      }

      const address: AddressInfo = {
        address: addressValue,
        balances: [],
        blockchain: blockchainIdToCode(account.blockchain),
      };

      const zeroAmount = accounts.selectors.zeroAmountFor<BigAmount>(blockchainIdToCode(account.blockchain));
      const balance = accounts.selectors.getBalance(state, account.id, zeroAmount) || zeroAmount;

      address.balances.push(balance);

      ({ value: addressValue } = account.address ?? {});

      if (addressValue == null) {
        return;
      }

      const balances =
        tokens.selectors.selectBalances(state, addressValue, blockchainIdToCode(account.blockchain)) ?? [];

      balances.filter((unit) => unit.isPositive()).forEach((unit) => address.balances.push(unit));

      addresses.push(address);
    });

  return { addresses };
})(Addresses);
