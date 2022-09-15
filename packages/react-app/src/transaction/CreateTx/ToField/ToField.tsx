import { BlockchainCode, PersistentState } from '@emeraldwallet/core';
import { IState, addressBook } from '@emeraldwallet/store';
import { Input } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';
import AddressBookMenu from './AddressBookMenu';
import FormLabel from '../FormLabel';

interface OwnProps {
  blockchain: BlockchainCode;
  to?: string;
  onChange(value: string): void;
}

interface StateProps {
  contacts: PersistentState.AddressbookItem[];
}

interface State {
  error: string | null;
  value: string;
}

type Props = OwnProps & StateProps;

class ToField extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      error: null,
      value: props.to ?? '',
    };
  }

  getRightIcon = (): React.ReactElement => {
    const { contacts } = this.props;

    return <AddressBookMenu contacts={contacts} onChange={(value) => this.onChange(value)} />;
  };

  onChange = (value: string): void => {
    this.setState({ value });

    this.props.onChange(value);

    if (value.length === 0) {
      this.setState({ error: 'Required' });
    } else {
      this.setState({ error: null });
    }
  };

  public render(): React.ReactElement {
    const { error, value } = this.state;

    return (
      <>
        <FormLabel>To</FormLabel>
        <Input
          errorText={error}
          rightIcon={this.getRightIcon()}
          value={value}
          onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => this.onChange(value)}
        />
      </>
    );
  }
}

export default connect<StateProps, {}, OwnProps, IState>((state, ownProps) => ({
  contacts: addressBook.selectors.byBlockchain(state, ownProps.blockchain),
}))(ToField);
