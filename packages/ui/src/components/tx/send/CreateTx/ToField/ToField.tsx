import { IdentityIcon, Input } from '@emeraldplatform/ui';
import * as React from 'react';

import FormLabel from '../FormLabel';
import AddressIconMenu from './AddressIconMenu';

interface Props {
  onChangeTo?: any;
  to?: string;
  addressBookAddresses?: any[];
  onEmptyAddressBookClick?: Function;
}

interface State {
  errorText: string | null;
  toStr?: string;
}

class ToField extends React.Component<Props, State> {

  public inputStyles = {
    flexGrow: 5
  };
  constructor (props: Props) {
    super(props);
    this.onChangeTo = this.onChangeTo.bind(this);
    this.state = { errorText: null, toStr: props.to || '0x' };
  }

  public componentDidMount () {
    this.onChangeTo(this.props.to);
  }

  public componentDidUpdate (prevProps: any) {
    if (prevProps.to !== this.props.to) {
      this.onChangeTo(this.props.to);
    }
  }

  public onChangeTo (value: any) {
    if (this.props.onChangeTo) {
      this.props.onChangeTo(value);
    }
    this.setState({ toStr: value });

    if (!value) {
      this.setState({ errorText: 'Required' });
    } else {
      this.setState({ errorText: null });
    }
  }

  public handleInputChange = (event: any) => {
    const { value } = event.target;
    this.onChangeTo(value);
  }

  public getLeftIcon () {
    if (!this.props.to) {
      return null;
    }
    return (
      <IdentityIcon
        size={30}
        id={this.props.to}
      />
    );
  }

  public getRightIcon () {
    return (
      <AddressIconMenu
        onChange={(val: any) => this.onChangeTo(val)}
        addressBookAddresses={this.props.addressBookAddresses}
        onEmptyAddressBookClick={this.props.onEmptyAddressBookClick}
      />
    );
  }

  public render () {
    return (
      <React.Fragment>
        <FormLabel>To</FormLabel>
        <div style={this.inputStyles}>
          <Input
            leftIcon={this.getLeftIcon()}
            rightIcon={this.getRightIcon()}
            value={this.state.toStr}
            errorText={this.state.errorText}
            onChange={this.handleInputChange}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default ToField;
