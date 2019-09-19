import { Book } from '@emeraldplatform/ui-icons';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import * as React from 'react';
import AddressIconMenuItem from './AddressIconMenuItem';

interface Props {
  addressBookAddresses?: string[];
  onEmptyAddressBookClick?: any;
  onChange?: Function;
}

interface State {
  menuOpen: boolean;
}

class AddressIconMenu extends React.Component<Props, State> {
  public anchorEl: any;

  constructor (props: Props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this.renderAddresses = this.renderAddresses.bind(this);
    this.state = {
      menuOpen: false
    };
  }

  public onChange (address: string) {
    this.setMenuOpen(false);
    if (this.props.onChange) {
      this.props.onChange(address);
    }
  }

  public onClick () {
    this.setState((state) => ({ menuOpen: !state.menuOpen }));
  }

  public handleClose = () => {
    this.setState({ menuOpen: false });
  }

  public setMenuOpen (status: boolean) {
    this.setState({ menuOpen: status });
  }

  public renderAddresses () {
    const { addressBookAddresses, onEmptyAddressBookClick } = this.props;
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

  public render () {
    return (
      <div>
        <IconButton
          buttonRef={(node) => {
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
