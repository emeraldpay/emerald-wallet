import { BlockchainCode, Blockchains, PersistentState } from '@emeraldwallet/core';
import { IState, addressBook, blockchains } from '@emeraldwallet/store';
import { Input } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';
import AddressBookMenu from './AddressBookMenu';
import FormLabel from '../FormLabel';

interface OwnProps {
  blockchain: BlockchainCode;
  to?: string;
  onChange(value: string | undefined): void;
}

interface StateProps {
  contacts: PersistentState.AddressbookItem[];
}

interface DispatchProps {
  lookupAddress(blockchain: BlockchainCode, address: string): Promise<string | null>;
  resolveName(blockchain: BlockchainCode, name: string): Promise<string | null>;
}

interface State {
  error: string | null;
  hint: string | null;
  value: string;
}

type Props = OwnProps & StateProps & DispatchProps;

class ToField extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      error: null,
      hint: null,
      value: props.to ?? '',
    };
  }

  getRightIcon = (): React.ReactElement => {
    const { contacts } = this.props;

    return <AddressBookMenu contacts={contacts} onChange={(value) => this.onChange(value)} />;
  };

  onChange = async (value: string): Promise<void> => {
    this.setState({ value, error: null, hint: null });

    const { blockchain, onChange, lookupAddress, resolveName } = this.props;

    if (blockchain === BlockchainCode.ETH || blockchain === BlockchainCode.Goerli) {
      if (/\.eth$/.test(value)) {
        onChange(undefined);

        const address = await resolveName(blockchain, value);

        if (address == null) {
          this.setState({ error: 'Name not found' });
        } else {
          onChange(address);

          this.setState({ hint: address });
        }
      } else {
        onChange(value);

        if (Blockchains[blockchain].isValidAddress(value)) {
          const name = await lookupAddress(blockchain, value);

          if (name != null) {
            this.setState({ hint: name });
          }
        }
      }
    } else {
      onChange(value);

      if (value.length === 0) {
        this.setState({ error: 'Required' });
      }
    }
  };

  public render(): React.ReactElement {
    const { error, hint, value } = this.state;

    return (
      <>
        <FormLabel>To</FormLabel>
        <Input
          errorText={error}
          hintText={hint}
          rightIcon={this.getRightIcon()}
          value={value}
          onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => this.onChange(value)}
        />
      </>
    );
  }
}

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, ownProps) => ({
    contacts: addressBook.selectors.byBlockchain(state, ownProps.blockchain),
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    lookupAddress(blockchain, address) {
      return dispatch(blockchains.actions.lookupAddress(blockchain, address));
    },
    resolveName(blockchain, name) {
      return dispatch(blockchains.actions.resolveName(blockchain, name));
    },
  }),
)(ToField);
