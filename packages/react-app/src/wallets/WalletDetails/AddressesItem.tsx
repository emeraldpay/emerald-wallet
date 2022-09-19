import { BigAmount } from '@emeraldpay/bigamount';
import { BlockchainCode, Blockchains } from '@emeraldwallet/core';
import { accounts } from '@emeraldwallet/store';
import { Address, Balance, CoinAvatar } from '@emeraldwallet/ui';
import { TableCell, TableRow, createStyles, makeStyles } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import * as React from 'react';
import { connect } from 'react-redux';
import { AddressInfo } from './Addresses';

const useStyles = makeStyles(() =>
  createStyles({
    address: {
      width: 'auto',
    },
  }),
);

interface OwnProps {
  item: AddressInfo;
}

interface StateProps {
  zeroAmountFor(blockchain: BlockchainCode): BigAmount;
}

const AddressesItem: React.FC<OwnProps & StateProps> = ({
  item: { address, balances, blockchain, hdPath },
  zeroAmountFor,
}) => {
  const styles = useStyles();

  const addressBalances = React.useMemo(() => {
    const zeroAmount = zeroAmountFor(blockchain);

    if (address == null) {
      return [zeroAmount];
    }

    return balances[address] ?? [zeroAmount];
  }, [address, balances, blockchain, zeroAmountFor]);

  return (
    <TableRow>
      <TableCell>
        <CoinAvatar chain={blockchain} />
      </TableCell>
      <TableCell>{Blockchains[blockchain].getTitle()}</TableCell>
      <TableCell>{hdPath}</TableCell>
      <TableCell>
        {address == null ? (
          <Skeleton variant="text" width={380} height={12} />
        ) : (
          <Address address={address} classes={{ root: styles.address }} />
        )}
      </TableCell>
      <TableCell>
        {addressBalances.map((balance) => (
          <Balance key={'balance-' + balance.units.top.code} balance={balance} />
        ))}
      </TableCell>
    </TableRow>
  );
};

export default connect<StateProps>(() => ({
  zeroAmountFor(blockchain) {
    return accounts.selectors.zeroAmountFor(blockchain);
  },
}))(AddressesItem);
