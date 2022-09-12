import { PersistentState } from '@emeraldwallet/core';
import { Book } from '@emeraldwallet/ui';
import { IconButton, Menu, MenuItem } from '@material-ui/core';
import * as React from 'react';
import AddressBookMenuItem from './AddressBookMenuItem';

interface Props {
  contacts: PersistentState.AddressbookItem[];
  onChange(value: string): void;
}

interface State {
  menuOpen: boolean;
}

class AddressBookMenu extends React.Component<Props, State> {
  menuElement: HTMLButtonElement | null = null;
  state = { menuOpen: false };

  onClick = (): void => {
    this.setState((state) => ({ menuOpen: !state.menuOpen }));
  };

  onClose = (): void => {
    this.setState({ menuOpen: false });
  };

  onChange = (value: string): void => {
    this.setState({ menuOpen: false });

    this.props.onChange(value);
  };

  public renderAddresses(): React.ReactElement | React.ReactElement[] {
    const { contacts } = this.props;

    if (contacts.length === 0) {
      return <MenuItem>No address book entries</MenuItem>;
    }

    return contacts.map((contact) => (
      <AddressBookMenuItem key={contact.id} contact={contact} onChange={this.onChange} />
    ));
  }

  public render(): React.ReactElement {
    return (
      <div>
        <IconButton ref={(node) => (this.menuElement = node)} onClick={this.onClick}>
          <Book />
        </IconButton>
        <Menu anchorEl={this.menuElement} open={this.state.menuOpen} onClose={this.onClose}>
          {this.renderAddresses()}
        </Menu>
      </div>
    );
  }
}

export default AddressBookMenu;
