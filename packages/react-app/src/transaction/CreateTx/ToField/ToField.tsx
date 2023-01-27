import { BlockchainCode, Blockchains, PersistentState } from '@emeraldwallet/core';
import { IState, addressBook, blockchains } from '@emeraldwallet/store';
import { FormLabel, Input } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';
import AddressBookMenu from './AddressBookMenu';

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

    const { isValidAddress } = Blockchains[blockchain];

    const to = value.trim();

    if (blockchain === BlockchainCode.ETH || blockchain === BlockchainCode.Goerli) {
      if (/\.eth$/.test(to)) {
        onChange(undefined);

        const address = await resolveName(blockchain, to);

        if (address == null) {
          this.setState({ error: 'Name not found' });
        } else {
          onChange(address);

          this.setState({ hint: address });
        }
      } else {
        onChange(to);

        if (to.length === 0) {
          this.setState({ error: 'Required' });
        } else if (isValidAddress(to)) {
          const name = await lookupAddress(blockchain, to);

          if (name != null) {
            this.setState({ hint: name });
          }
        } else {
          this.setState({ error: 'Incorrect address format' });
        }
      }
    } else {
      onChange(to);

      if (to.length === 0) {
        this.setState({ error: 'Required' });
      } else if (!isValidAddress(to)) {
        this.setState({ error: 'Incorrect address format' });
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
