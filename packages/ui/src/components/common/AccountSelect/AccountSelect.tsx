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
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {withStyles} from '@material-ui/core/styles';
import * as React from 'react';
import {Account} from '../Account';

const styles = (theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    cursor: 'pointer'
  }
});

interface IAccountSelectProps {
  onChange?: any;
  accounts?: string[];
  classes: any;
  selectedAccount?: any;
}

interface IState {
  selectedIndex?: any;
  anchorEl?: any;
}

export class AccountSelect extends React.Component<IAccountSelectProps, IState> {
  constructor(props) {
    super(props);
    const accounts = props.accounts || [];
    const selectedIndex = accounts.indexOf(props.selectedAccount);
    this.state = {
      anchorEl: null,
      selectedIndex: (selectedIndex >= 0) ? selectedIndex : 0
    };
    this.renderAccounts = this.renderAccounts.bind(this);
  }

  public handleClickListItem = (event) => {
    this.setState({anchorEl: event.currentTarget});
  }

  public handleMenuItemClick = (event, index) => {
    this.setState({selectedIndex: index, anchorEl: null});
    if (this.props.onChange && this.props.accounts) {
      this.props.onChange(this.props.accounts[index]);
    }
  }

  public handleClose = () => {
    this.setState({anchorEl: null});
  }

  public renderAccounts() {
    const accounts = this.props.accounts || [];
    return accounts.map((account, index) => (
      <MenuItem
        key={account}
        selected={index === this.state.selectedIndex}
      >
        <Account
          identity={true}
          addressProps={{
            hideCopy: true
          }}
          address={account}
          onClick={(event) => this.handleMenuItemClick(event, index)}
        />
      </MenuItem>
    ));
  }

  public renderSelected() {
    const accounts = this.props.accounts || [];
    if (accounts.length === 0) {
      return (<div>No accounts provided</div>);
    }
    const selected = accounts[this.state.selectedIndex];
    if (!selected) {
      return null;
    }
    return (
      <Account
        identity={true}
        onClick={this.handleClickListItem}
        address={selected}
        addressWidth='200px'
        addressProps={{
          shortened: false
        }}
      />
    );
  }

  public render() {
    const {classes} = this.props;
    const {anchorEl} = this.state;

    return (
      <div className={classes.root}>
        {this.renderSelected()}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          {this.renderAccounts()}
        </Menu>
      </div>
    );
  }
}

export default withStyles(styles)(AccountSelect);
