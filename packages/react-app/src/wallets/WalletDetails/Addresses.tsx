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
            const blockchainCode = blockchainIdToCode(entry.blockchain);

            let identifiers: Identifiers[] = [];

            if (isBitcoinEntry(entry)) {
              identifiers = entry.xpub.map((xPub) => ({ xPub }));
            } else if (entry.address != null) {
              identifiers = [{ address: entry.address.value }];
            }

            const addressInfo: AddressInfo[] = identifiers.map(({ address, xPub }) => ({
              address,
              xPub,
              balances: {},
              blockchain: blockchainCode,
              entryId: entry.id,
              hdPath: isSeedPkRef(entry, entry.key) ? entry.key.hdPath : undefined,
            }));

            return carry.concat(
              addressInfo.map((addressInfo) => {
                if (isBitcoinEntry(entry)) {
                  const addressesBalance = accounts.selectors.getAddressesBalance(state, entry.id);

                  addressInfo.balances = Object.keys(addressesBalance).reduce(
                    (carry, address) => ({ ...carry, [address]: [addressesBalance[address]] }),
                    {},
                  );

                  return addressInfo;
                }

                if (addressInfo.address == null) {
                  return addressInfo;
                }

                const zeroAmount = accounts.selectors.zeroAmountFor<BigAmount>(blockchainCode);

                const balance = accounts.selectors.getBalance(state, entry.id, zeroAmount);
                const tokensBalance =
                  tokens.selectors
                    .selectBalances(state, blockchainCode, addressInfo.address)
                    ?.filter((balance) => balance.isPositive()) ?? [];

                addressInfo.balances[addressInfo.address] = [balance, ...tokensBalance];

                return addressInfo;
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
