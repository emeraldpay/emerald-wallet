import { BigAmount } from '@emeraldpay/bigamount';
import {
  AddressRole,
  CurrentAddress,
  EntryId,
  Uuid,
  isBitcoinEntry,
  isEthereumEntry,
} from '@emeraldpay/emerald-vault-core';
import { isSeedPkRef } from '@emeraldpay/emerald-vault-core/lib/types';
import { BlockchainCode, Blockchains, blockchainIdToCode } from '@emeraldwallet/core';
import { IState, accounts, tokens } from '@emeraldwallet/store';
import { getXPubPositionalAddress } from '@emeraldwallet/store/lib/accounts/actions';
import { Address, Balance, CoinAvatar } from '@emeraldwallet/ui';
import { Table, TableBody, TableCell, TableRow, createStyles, makeStyles } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import * as React from 'react';
import { connect } from 'react-redux';

const useStyles = makeStyles(() =>
  createStyles({
    address: {
      width: 'auto',
    },
  }),
);

interface AddressInfo {
  address?: string;
  balances: BigAmount[];
  blockchain: BlockchainCode;
  entryId: EntryId;
  hdPath?: string;
  xPub?: string;
}

interface OwnProps {
  walletId: Uuid;
}

interface StateProps {
  addressesInfo: AddressInfo[];
}

interface DispatchProps {
  getXPubPositionalAddress(entryId: string, xPub: string, role: AddressRole): Promise<CurrentAddress>;
}

const Addresses: React.FC<OwnProps & StateProps & DispatchProps> = ({ addressesInfo, getXPubPositionalAddress }) => {
  const styles = useStyles();

  const [addresses, setAddresses] = React.useState(addressesInfo);

  React.useEffect(() => {
    Promise.all(
      addressesInfo.map(async (address) => {
        if (address.address == null && address.xPub != null) {
          const { address: xPubAddress } = await getXPubPositionalAddress(address.entryId, address.xPub, 'receive');

          return {
            ...address,
            address: xPubAddress,
          };
        }

        return address;
      }),
    ).then(setAddresses);
  }, [addressesInfo, getXPubPositionalAddress]);

  return (
    <Table>
      <TableBody>
        {addresses.map(({ address, balances, blockchain, hdPath }, index) => (
          <TableRow key={`address-${address}[${index}]`}>
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
              {balances.map((balance) => (
                <Balance key={'balance-' + balance.units.top.code} balance={balance} />
              ))}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, ownProps) => {
    const wallet = accounts.selectors.findWallet(state, ownProps.walletId);

    return {
      addressesInfo:
        wallet?.entries
          .filter((entry) => !entry.receiveDisabled)
          .reduce<AddressInfo[]>((carry, entry) => {
            let address: string | undefined;
            let xPub: string | undefined;

            if (isEthereumEntry(entry)) {
              address = entry.address?.value;
            } else if (isBitcoinEntry(entry)) {
              ({ xpub: xPub } = entry.xpub.find(({ role }) => role === 'receive') ?? {});
            }

            const addressInfo: AddressInfo = {
              xPub,
              address,
              balances: [],
              blockchain: blockchainIdToCode(entry.blockchain),
              entryId: entry.id,
              hdPath: isSeedPkRef(entry, entry.key) ? entry.key.hdPath : undefined,
            };

            const zeroAmount = accounts.selectors.zeroAmountFor<BigAmount>(blockchainIdToCode(entry.blockchain));
            const balance = accounts.selectors.getBalance(state, entry.id, zeroAmount) || zeroAmount;

            addressInfo.balances.push(balance);

            if (address == null) {
              return [...carry, addressInfo];
            }

            const balances =
              tokens.selectors.selectBalances(state, address, blockchainIdToCode(entry.blockchain)) ?? [];

            balances.filter((unit) => unit.isPositive()).forEach((unit) => addressInfo.balances.push(unit));

            return [...carry, addressInfo];
          }, []) ?? [],
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    getXPubPositionalAddress(entryId, xPub, role) {
      return dispatch(getXPubPositionalAddress(entryId, xPub, role));
    },
  }),
)(Addresses);
