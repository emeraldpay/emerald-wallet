import React from 'react';
import PropTypes from 'prop-types';
import { IconMenu, MenuItem } from 'material-ui';
import { Book } from '@emeraldplatform/ui-icons';
import AddressIconMenuItem from './AddressIconMenuItem';

class AddressIconMenu extends React.Component {
  static propTypes = {
    addressBookAddresses: PropTypes.arrayOf(PropTypes.string).isRequired,
    onEmptyAddressBookClick: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  constructor() {
    super();
    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onRequestChange = this.onRequestChange.bind(this);
    this.renderAddresses = this.renderAddresses.bind(this);
    this.state = {};
  }

  onChange(address) {
    this.setMenuOpen(false);
    this.props.onChange(address);
  }

  onRequestChange(status) {
    this.setMenuOpen(status);
  }

  onClick() {
    this.setState({ menuOpen: true });
  }

  setMenuOpen(status) {
    this.setState({ menuOpen: status });
  }

  renderAddresses() {
    if (this.props.addressBookAddresses.length === 0) {
      return (
        <MenuItem
          onClick={this.props.onEmptyAddressBookClick}
          primaryText="Click to create an address book entry"
        />
      );
    }

    return this.props.addressBookAddresses.map(
      (address) => (<AddressIconMenuItem key={address} address={address} onChange={this.onChange} />)
    );
  }

  render() {
    return (
      <IconMenu
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
        iconButtonElement={<Book />}
        open={this.state.menuOpen}
        onClick={this.onClick}
        useLayerForClickAway={false}
        onRequestChange={this.onRequestChange}
      >
        { this.renderAddresses() }
      </IconMenu>
    );
  }
}

export default AddressIconMenu;
