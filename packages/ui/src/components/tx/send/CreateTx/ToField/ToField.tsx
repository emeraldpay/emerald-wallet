import * as React from 'react';
import {Input, IdentityIcon} from '@emeraldplatform/ui';

import FormLabel from '../FormLabel';
import AddressIconMenu from './AddressIconMenu';

interface Props {
  onChangeTo?: any;
  to?: string,
  addressBookAddresses?: Array<any>,
  onEmptyAddressBookClick?: Function;
}

interface State {
  errorText: string | null;
}

class ToField extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.onChangeTo = this.onChangeTo.bind(this);
    this.state = {errorText: null};
  }

  componentDidMount() {
    this.onChangeTo(null, this.props.to);
  }

  componentDidUpdate(prevProps: any) {
    if (prevProps.to !== this.props.to) {
      this.onChangeTo(null, this.props.to);
    }
  }

  onChangeTo(event: any, value: any) {
    if (this.props.onChangeTo) {
      this.props.onChangeTo(value);
    }

    if (!value) {
      this.setState({errorText: 'Required'});
    } else {
      this.setState({errorText: null});
    }
  }

  getLeftIcon() {
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

  getRightIcon() {
    return (
      <AddressIconMenu
        onChange={(val: any) => this.onChangeTo(null, val)}
        addressBookAddresses={this.props.addressBookAddresses}
        onEmptyAddressBookClick={this.props.onEmptyAddressBookClick}
      />
    );
  }

  inputStyles = {
    flexGrow: 5,
  };

  render() {
    return (
      <React.Fragment>
        <FormLabel>To</FormLabel>
        <div style={this.inputStyles}>
          <Input
            leftIcon={this.getLeftIcon()}
            rightIcon={this.getRightIcon()}
            value={this.props.to}
            errorText={this.state.errorText}
            onChange={this.onChangeTo}
          />
        </div>
      </React.Fragment>
    );
  }
}

export default ToField;
