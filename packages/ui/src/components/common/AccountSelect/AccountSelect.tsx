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

import { StyleRules, Theme } from '@material-ui/core';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { Account } from '../Account';

const styles = (theme: Theme): StyleRules => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    width: '100%',
  },
});

interface OwnProps {
  accounts?: string[];
  classes: Record<string, string>;
  disabled?: boolean;
  selectedAccount?: string;
  getBalancesByAddress?(address: string): string[];
  onChange?(account: string): void;
}

interface StateProps {
  anchorElement?: HTMLDivElement;
  selectedIndex?: number;
}

export class AccountSelect extends React.Component<OwnProps, StateProps> {
  constructor(props) {
    super(props);

    const { accounts = [], selectedAccount } = props;

    const selectedIndex = selectedAccount == null ? 0 : accounts.indexOf(selectedAccount);

    this.state = {
      anchorElement: null,
      selectedIndex: selectedIndex >= 0 ? selectedIndex : 0,
    };

    this.renderAccounts = this.renderAccounts.bind(this);
  }

  public handleListItemClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    this.setState({ anchorElement: event.currentTarget });
  };

  public handleMenuItemClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number): void => {
    this.setState({ selectedIndex: index, anchorElement: null });

    const { accounts = [], onChange } = this.props;

    if (onChange != null && accounts.length > 0) {
      onChange(this.props.accounts[index]);
    }
  };

  public handleClose = (): void => {
    this.setState({ anchorElement: null });
  };

  public renderAccounts(): React.ReactElement[] {
    const { accounts = [], getBalancesByAddress } = this.props;

    return accounts.map((account, index) => (
      <MenuItem key={account} selected={index === this.state.selectedIndex}>
        <Account
          address={account}
          addressProps={{ hideCopy: true }}
          identity={true}
          getBalancesByAddress={getBalancesByAddress}
          onClick={(event) => this.handleMenuItemClick(event, index)}
        />
      </MenuItem>
    ));
  }

  public renderSelected(): React.ReactElement {
    const { accounts = [], disabled = false } = this.props;

    if (accounts.length === 0) {
      return <div>No accounts provided</div>;
    }

    const selected = accounts[this.state.selectedIndex];

    if (selected == null) {
      return null;
    }

    return (
      <Account
        address={selected}
        addressWidth={380}
        disabled={disabled}
        identity={true}
        onClick={this.handleListItemClick}
      />
    );
  }

  public render(): React.ReactElement {
    const { classes } = this.props;
    const { anchorElement } = this.state;

    return (
      <div className={classes.root}>
        {this.renderSelected()}
        <Menu anchorEl={anchorElement} open={anchorElement != null} onClose={this.handleClose}>
          {this.renderAccounts()}
        </Menu>
      </div>
    );
  }
}

export default withStyles(styles)(AccountSelect);
