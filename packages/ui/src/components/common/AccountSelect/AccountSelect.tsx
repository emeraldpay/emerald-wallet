/*
Copyright 2019 ETCDEV GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import {Menu, MenuItem} from '@mui/material';
import * as React from 'react';
import { Account } from '../Account';
import Monospace from '../Monospace';

interface AccountItem {
  address: string;
  ownerAddress?: string;
}

interface Accounts {
  [key: string]: AccountItem | string;
}

interface OwnProps {
  accounts?: Accounts;
  disabled?: boolean;
  selectedAccount?: string;
  getBalancesByAddress?(address: string, ownerAddress: string | null): string[];
  onChange?(account: string): void;
}

interface StateProps {
  menuElement?: HTMLDivElement;
  selectedAccount?: string;
}

export class AccountSelect extends React.Component<OwnProps, StateProps> {
  constructor(props) {
    super(props);

    const { accounts = {} } = props;

    let { selectedAccount } = props;

    if (selectedAccount == null) {
      [selectedAccount] = Object.keys(accounts);
    }

    this.state = {
      selectedAccount,
      menuElement: null,
    };

    this.renderAccounts = this.renderAccounts.bind(this);
  }

  public handleMenuOpen = (event: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    this.setState({ menuElement: event.currentTarget });
  };

  public handleMenuClose = (): void => {
    this.setState({ menuElement: null });
  };

  public handleMenuItemClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, selectedAccount: string): void => {
    this.setState({ selectedAccount, menuElement: null });

    this.props.onChange?.(selectedAccount);
  };

  public renderAccounts(): React.ReactNode[] {
    const { accounts = {}, getBalancesByAddress } = this.props;

    return Object.entries(accounts).map(([key, account]) => {
      const { address, ownerAddress = null } = typeof account === 'string' ? { address: account } : account;

      let description: React.ReactElement;

      if (ownerAddress != null) {
        description = (
          <>
            Owner <Monospace text={ownerAddress} />
          </>
        );
      }

      return (
        <MenuItem key={key} selected={key === this.state.selectedAccount}>
          <Account
            address={address}
            addressProps={{ hideCopy: true }}
            balances={getBalancesByAddress?.(address, ownerAddress)}
            description={description}
            identity={true}
            onClick={(event) => this.handleMenuItemClick(event, key)}
          />
        </MenuItem>
      );
    });
  }

  public renderSelected(): React.ReactNode {
    const { accounts = {}, disabled = false } = this.props;

    if (Object.keys(accounts).length === 0) {
      return <div>No accounts provided</div>;
    }

    const { [this.state.selectedAccount]: selected } = accounts;

    if (selected == null) {
      return null;
    }

    const { address, ownerAddress = null } = typeof selected === 'string' ? { address: selected } : selected;

    let description: React.ReactElement;

    if (ownerAddress != null) {
      description = (
        <>
          Owner <Monospace text={ownerAddress} />
        </>
      );
    }

    return (
      <Account
        address={address}
        addressWidth={450}
        description={description}
        disabled={disabled}
        identity={true}
        onClick={this.handleMenuOpen}
      />
    );
  }

  public render(): React.ReactNode {
    const { menuElement } = this.state;

    return (
      <>
        {this.renderSelected()}
        <Menu anchorEl={menuElement} open={menuElement != null} onClose={this.handleMenuClose}>
          {this.renderAccounts()}
        </Menu>
      </>
    );
  }
}

export default AccountSelect;
