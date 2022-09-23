import { BlockchainCode, PersistentState, blockchainIdToCode } from '@emeraldwallet/core';
import { accounts, addressBook, transaction } from '@emeraldwallet/store';
import { Account } from '@emeraldwallet/ui';
import MenuItem from '@material-ui/core/MenuItem';
import * as React from 'react';
import { connect } from 'react-redux';

interface OwnProps {
  contact: PersistentState.AddressbookItem;
  forwardRef?: React.Ref<HTMLElement>;
  onChange(id: string, address: string): void;
  onPrevent(id: string): void;
}

interface DispatchProps {
  getAddressBookItem(id: string): Promise<PersistentState.AddressbookItem>;
  getXPubLastIndex(blockchain: BlockchainCode, xpub: string): Promise<number>;
  setXPubIndex(xpub: string, position: number): Promise<void>;
}

type Props = OwnProps & DispatchProps;

class AddressBookMenuItem extends React.Component<Props> {
  onClick = async (): Promise<void> => {
    const {
      contact: {
        address: { address, currentAddress, type },
        blockchain,
        id,
      },
      onChange,
      onPrevent,
      getAddressBookItem,
      getXPubLastIndex,
      setXPubIndex,
    } = this.props;

    if (id == null) {
      return;
    }

    onPrevent(id);

    if (type === 'xpub') {
      const lastIndex = await getXPubLastIndex(blockchainIdToCode(blockchain), address);

      if (lastIndex == null) {
        if (currentAddress == null) {
          return;
        }

        onChange(id, currentAddress);
      } else {
        await setXPubIndex(address, lastIndex);

        const {
          address: { currentAddress },
        } = await getAddressBookItem(id);

        if (currentAddress == null) {
          return;
        }

        onChange(id, currentAddress);
      }
    } else {
      onChange(id, address);
    }
  };

  public render(): React.ReactElement {
    const {
      contact: {
        address: { address, type },
        label,
      },
      forwardRef,
    } = this.props;

    return (
      <MenuItem innerRef={forwardRef} onClick={this.onClick}>
        <Account
          address={type === 'xpub' ? `${address.slice(0, 8)}..${address.slice(-4)}` : address}
          addressProps={{ hideCopy: true }}
          name={label}
        />
      </MenuItem>
    );
  }
}

export default connect<{}, DispatchProps>(
  null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    getAddressBookItem(id) {
      return dispatch(addressBook.actions.getAddressBookItem(id));
    },
    async getXPubLastIndex(blockchain, xpub) {
      const start = await dispatch(accounts.actions.getXPubPosition(xpub));

      return dispatch(transaction.actions.getXPubLastIndex(blockchain, xpub, start));
    },
    setXPubIndex(xpub, position) {
      return dispatch(transaction.actions.setXPubCurrentIndex(xpub, position));
    },
  }),
  null,
  {
    forwardRef: true,
  },
)(AddressBookMenuItem);
