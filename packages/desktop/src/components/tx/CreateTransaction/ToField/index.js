import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Input, IdentityIcon } from 'emerald-js-ui';

import FormLabel from '../FormLabel';
import AddressIconMenu from './AddressIconMenu';

class ToField extends React.Component {
  static propTypes = {
    onChangeTo: PropTypes.func.isRequired,
    to: PropTypes.string.isRequired,
    addressBookAddresses: PropTypes.arrayOf(PropTypes.string).isRequired,
    onEmptyAddressBookClick: PropTypes.func.isRequired,
  }

  constructor() {
    super();
    this.onChangeTo = this.onChangeTo.bind(this);
    this.state = { errorText: null };
  }

  componentDidMount() {
    this.onChangeTo(null, this.props.to);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.to !== this.props.to) {
      this.onChangeTo(null, this.props.to);
    }
  }

  onChangeTo(event, value) {
    this.props.onChangeTo(value);

    if (!value) {
      this.setState({ errorText: 'Required' });
    } else {
      this.setState({ errorText: null });
    }
  }

  getLeftIcon() {
    if (!this.props.to) { return null; }
    return (
      <IdentityIcon
        style={{ marginRight: '5px' }}
        size={30}
        id={this.props.to}
      />
    );
  }

  getRightIcon() {
    return (
      <AddressIconMenu
        onChange={(val) => this.onChangeTo(null, val)}
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
      <Fragment>
        <FormLabel>To</FormLabel>
        <Input
          leftIcon={this.getLeftIcon()}
          rightIcon={this.getRightIcon()}
          containerStyle={this.inputStyles}
          value={this.props.to}
          errorText={this.state.errorText}
          onChange={this.onChangeTo}
        />
      </Fragment>
    );
  }
}

export default ToField;
