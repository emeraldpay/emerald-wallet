import { PersistentState } from '@emeraldwallet/core';
import { Book as BookIcon } from '@emeraldwallet/ui';
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
  state: State = { menuOpen: false };

  preventId?: string;

  onClick = (): void => {
    this.setState((state) => ({ menuOpen: !state.menuOpen }));
  };

  onClose = (): void => {
    this.setState({ menuOpen: false });
  };

  onChange = (id: string, value: string): void => {
    this.setState({ menuOpen: false });

    if (this.preventId === id) {
      this.props.onChange(value);
    }
  };

  onPrevent = (id: string): void => {
    this.preventId = id;
  };

  public renderAddresses(): React.ReactNode {
    const { contacts } = this.props;

    if (contacts.length === 0) {
      return <MenuItem>No address book entries</MenuItem>;
    }

    return contacts.map((contact) => (
      <AddressBookMenuItem key={contact.id} contact={contact} onChange={this.onChange} onPrevent={this.onPrevent} />
    ));
  }

  public render(): React.ReactNode {
    return (
      <div>
        <IconButton ref={(node) => (this.menuElement = node)} size="small" onClick={this.onClick}>
          <BookIcon fontSize="small" />
        </IconButton>
        <Menu anchorEl={this.menuElement} open={this.state.menuOpen} onClose={this.onClose}>
          {this.renderAddresses()}
        </Menu>
      </div>
    );
  }
}

export default AddressBookMenu;
