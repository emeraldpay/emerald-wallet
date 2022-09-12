import { BlockchainCode, PersistentState, blockchainIdToCode } from '@emeraldwallet/core';
import { addressBook, transaction } from '@emeraldwallet/store';
import { Account } from '@emeraldwallet/ui';
import MenuItem from '@material-ui/core/MenuItem';
import * as React from 'react';
import { connect } from 'react-redux';

interface OwnProps {
  contact: PersistentState.AddressbookItem;
  forwardRef?: React.Ref<HTMLElement>;
  onChange: Function;
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
        address: { address, type },
        blockchain,
        id,
      },
      onChange,
      getAddressBookItem,
      getXPubLastIndex,
      setXPubIndex,
    } = this.props;

    if (type === 'xpub') {
      const lastIndex = await getXPubLastIndex(blockchainIdToCode(blockchain), address);

      await setXPubIndex(address, lastIndex + 1);

      if (id != null) {
        const contact = await getAddressBookItem(id);

        onChange(contact.address.address);
      }
    } else {
      onChange(address);
    }
  };

  public render(): React.ReactElement {
    const {
      contact: {
        address: { address },
        label,
      },
      forwardRef,
    } = this.props;

    return (
      <MenuItem innerRef={forwardRef} onClick={this.onClick}>
        <Account address={address} addressProps={{ hideCopy: true }} name={label} />
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
    getXPubLastIndex(blockchain, xpub) {
      return dispatch(transaction.actions.getXPubLastIndex(blockchain, xpub));
    },
    setXPubIndex(xpub, position) {
      return dispatch(transaction.actions.setXPubIndex(xpub, position));
    },
  }),
  null,
  {
    forwardRef: true,
  },
)(AddressBookMenuItem);
