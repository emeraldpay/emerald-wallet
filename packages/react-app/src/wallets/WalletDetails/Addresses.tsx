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
import { BlockchainCode, blockchainIdToCode } from '@emeraldwallet/core';
import { IState, accounts, tokens } from '@emeraldwallet/store';
import { Table, TableBody } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import AddressesItem from './AddressesItem';

export interface AddressInfo {
  address?: string;
  balances: { [address: string]: BigAmount[] };
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
  getAllXPubAddresses(entryId: string, xPub: string, role: AddressRole): Promise<CurrentAddress[]>;
}

const Addresses: React.FC<OwnProps & StateProps & DispatchProps> = ({ addressesInfo, getAllXPubAddresses }) => {
  const [addresses, setAddresses] = React.useState(addressesInfo);

  React.useEffect(() => {
    Promise.all(
      addressesInfo.map(async (address) => {
        if (address.address == null && address.xPub != null) {
          const xPubAddresses = await getAllXPubAddresses(address.entryId, address.xPub, 'receive');

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
            let address: string | undefined;
            let xPub: string | undefined;

            if (isEthereumEntry(entry)) {
              address = entry.address?.value;
            } else if (isBitcoinEntry(entry)) {
              ({ xpub: xPub } = entry.xpub.find(({ role }) => role === 'receive') ?? {});
            }

            const blockchainCode = blockchainIdToCode(entry.blockchain);

            const addressInfo: AddressInfo = {
              xPub,
              address,
              balances: {},
              blockchain: blockchainCode,
              entryId: entry.id,
              hdPath: isSeedPkRef(entry, entry.key) ? entry.key.hdPath : undefined,
            };

            if (isBitcoinEntry(entry)) {
              const addressesBalance = accounts.selectors.getAddressesBalance(state, entry.id);

              addressInfo.balances = Object.keys(addressesBalance).reduce(
                (carry, address) => ({ ...carry, [address]: [addressesBalance[address]] }),
                {},
              );

              return [...carry, addressInfo];
            }

            if (address == null) {
              return carry;
            }

            const zeroAmount = accounts.selectors.zeroAmountFor<BigAmount>(blockchainCode);

            const balance = accounts.selectors.getBalance(state, entry.id, zeroAmount);
            const tokensBalance =
              tokens.selectors
                .selectBalances(state, address, blockchainCode)
                ?.filter((balance) => balance.isPositive()) ?? [];

            addressInfo.balances[address] = [balance, ...tokensBalance];

            return [...carry, addressInfo];
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
