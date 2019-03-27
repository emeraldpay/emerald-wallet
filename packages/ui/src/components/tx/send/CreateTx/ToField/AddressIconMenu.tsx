import * as React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import IconButton from '@material-ui/core/IconButton';
import {Book} from '@emeraldplatform/ui-icons';
import AddressIconMenuItem from './AddressIconMenuItem';

interface Props {
  addressBookAddresses?: Array<string>;
  onEmptyAddressBookClick?: any,
  onChange?: Function;
}

interface State {
  menuOpen: boolean;
}

class AddressIconMenu extends React.Component<Props, State> {
  anchorEl: any;

  constructor(props: Props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this.renderAddresses = this.renderAddresses.bind(this);
    this.state = {
      menuOpen: false
    };
  }

  onChange(address: string) {
    this.setMenuOpen(false);
    if (this.props.onChange) {
      this.props.onChange(address);
    }
  }

  onClick() {
    this.setState(state => ({menuOpen: !state.menuOpen}));
  }

  handleClose = () => {
    this.setState({menuOpen: false});
  };

  setMenuOpen(status: boolean) {
    this.setState({menuOpen: status});
  }

  renderAddresses() {
    const {addressBookAddresses, onEmptyAddressBookClick} = this.props;
    if ((!addressBookAddresses) || (addressBookAddresses.length === 0)) {
      return (
        <MenuItem onClick={onEmptyAddressBookClick}>
          Click to create an address book entry
        </MenuItem>
      );
    }

    return addressBookAddresses.map(
      (address) => (<AddressIconMenuItem key={address} address={address} onChange={this.onChange}/>)
    );
  }

  render() {
    return (
      <div>
        <IconButton
          buttonRef={node => {
            this.anchorEl = node;
          }}
          onClick={this.onClick}
        >
          <Book/>
        </IconButton>
        <Menu
          anchorEl={this.anchorEl}
          open={this.state.menuOpen}
          onClose={this.handleClose}
        >
          {this.renderAddresses()}
        </Menu>
      </div>
    );
  }
}

export default AddressIconMenu;
