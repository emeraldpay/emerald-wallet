import { BigAmount } from '@emeraldpay/bigamount';
import {
  AddressRole,
  CurrentAddress,
  CurrentXpub,
  EntryId,
  Uuid,
  isBitcoinEntry,
} from '@emeraldpay/emerald-vault-core';
import { isSeedPkRef } from '@emeraldpay/emerald-vault-core/lib/types';
import { BlockchainCode, blockchainIdToCode } from '@emeraldwallet/core';
import { IState, accounts, tokens } from '@emeraldwallet/store';
import { Table } from '@emeraldwallet/ui';
import { TableBody } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import AddressesItem from './AddressesItem';

export interface Identifiers {
  address?: string;
  xPub?: CurrentXpub;
}

export interface AddressInfo extends Identifiers {
  balances: { [address: string]: BigAmount[] };
  blockchain: BlockchainCode;
  entryId: EntryId;
  hdPath?: string;
}

interface OwnProps {
  walletId: Uuid;
}

interface StateProps {
  addressesInfo: AddressInfo[];
}

interface DispatchProps {
  getAllXPubAddresses(entryId: string, xPub: string, role: AddressRole): Promise<CurrentAddress[]>;
}

const Addresses: React.FC<OwnProps & StateProps & DispatchProps> = ({ addressesInfo, getAllXPubAddresses }) => {
  const [addresses, setAddresses] = React.useState(addressesInfo);

  React.useEffect(() => {
    Promise.all(
      addressesInfo.map(async (address) => {
        if (address.address == null && address.xPub != null) {
          const xPubAddresses = await getAllXPubAddresses(address.entryId, address.xPub.xpub, address.xPub.role);

          return xPubAddresses.map(({ address: xPubAddress, hdPath }) => ({
            ...address,
            hdPath,
            address: xPubAddress,
          }));
        }

        return [address];
      }),
    ).then((items) => setAddresses(items.flat()));
  }, [addressesInfo, getAllXPubAddresses]);

  return (
    <Table>
      <TableBody>
        {addresses.map((address, index) => (
          <AddressesItem key={`address-${address}[${index}]`} item={address} />
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
            let identifiers: Identifiers[] = [];

            if (isBitcoinEntry(entry)) {
              identifiers = entry.xpub.map((xPub) => ({ xPub }));
            } else if (entry.address != null) {
              identifiers = [{ address: entry.address.value }];
            }

            const addressInfo = carry.find(
              (info) =>
                identifiers.find(
                  (identifier) =>
                    identifier.address === info.address ||
                    (identifier.xPub != null && identifier.xPub.xpub === info.xPub?.xpub),
                ) != null,
            );

            if (addressInfo != null) {
              return carry;
            }

            const blockchainCode = blockchainIdToCode(entry.blockchain);

            const addressesInfo: AddressInfo[] = identifiers.map(({ address, xPub }) => ({
              address,
              xPub,
              balances: {},
              blockchain: blockchainCode,
              entryId: entry.id,
              hdPath: isSeedPkRef(entry, entry.key) ? entry.key.hdPath : undefined,
            }));

            return carry.concat(
              addressesInfo.map((info) => {
                if (isBitcoinEntry(entry)) {
                  const addressesBalance = accounts.selectors.getAddressesBalance(state, entry.id);

                  info.balances = Object.keys(addressesBalance).reduce(
                    (carry, address) => ({ ...carry, [address]: [addressesBalance[address]] }),
                    {},
                  );

                  return info;
                }

                if (info.address == null) {
                  return info;
                }

                const zeroAmount = accounts.selectors.zeroAmountFor<BigAmount>(blockchainCode);

                const balance = accounts.selectors.getBalance(state, entry.id, zeroAmount);
                const tokenBalance =
                  tokens.selectors
                    .selectBalances(state, blockchainCode, info.address)
                    ?.filter((balance) => balance.isPositive()) ?? [];

                info.balances[info.address] = [balance, ...tokenBalance];

                return info;
              }),
            );
          }, []) ?? [],
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    getAllXPubAddresses(entryId, xPub, role) {
      return dispatch(accounts.actions.getAllXPubAddresses(entryId, xPub, role));
    },
  }),
)(Addresses);
