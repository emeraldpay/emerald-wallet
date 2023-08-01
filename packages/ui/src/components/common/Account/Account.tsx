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

import { createStyles } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import cx from 'classnames';
import * as React from 'react';
import { Pen3 as EditIcon } from '../../../icons';
import Address from '../Address';
import IdentityIcon from '../IdentityIcon';

export const styles = createStyles({
  accountBalance: {
    fontSize: 15,
    marginRight: 10,
  },
  accountBalances: {
    display: 'flex',
  },
  accountContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  accountNameContainer: {
    alignItems: 'center',
    display: 'flex',
  },
  clickable: {
    cursor: 'pointer',
  },
  editNameIconContainer: {
    marginLeft: 5,
  },
  identityIcon: {
    marginRight: 20,
  },
  nameEditIcon: {
    cursor: 'pointer',
    height: 13,
    width: 13,
  },
  nameTypography: {
    fontSize: 14,
    lineHeight: 2,
  },
  root: {
    alignItems: 'center',
    cursor: 'default',
    display: 'flex',
    width: '100%',
  },
});

interface OwnProps {
  address: string;
  addressProps?: Record<string, unknown>;
  addressWidth?: number | string;
  classes: Record<keyof typeof styles, string>;
  disabled?: boolean;
  editable?: boolean;
  identity?: boolean;
  identityProps?: Record<string, unknown>;
  name?: string;
  getBalancesByAddress?(address: string): string[];
  onClick?(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
  onEditClick?(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
}

export class Account extends React.PureComponent<OwnProps> {
  public static defaultProps = {
    addressWidth: 'auto',
    disabled: false,
    editable: false,
    name: null,
  };

  constructor(props) {
    super(props);

    this.getIdentityIcon = this.getIdentityIcon.bind(this);
    this.getNameEditIcon = this.getNameEditIcon.bind(this);
    this.getNameField = this.getNameField.bind(this);
  }

  public getIdentityIcon(): React.ReactElement {
    const { identity, classes, address } = this.props;

    if (identity == null) {
      return null;
    }

    return (
      <div className={classes.identityIcon}>
        <IdentityIcon id={address} />
      </div>
    );
  }

  public getNameEditIcon(): React.ReactElement {
    const { editable, classes, onEditClick } = this.props;

    if (editable === false) {
      return null;
    }

    return (
      <div className={classes.editNameIconContainer} onClick={onEditClick}>
        <EditIcon className={classes.nameEditIcon} />
      </div>
    );
  }

  public getNameField(): React.ReactElement {
    const { name, classes } = this.props;

    if (name === null) {
      return null;
    }

    return (
      <div className={classes.accountNameContainer}>
        <Typography className={classes.nameTypography}>{name}</Typography>
        {this.getNameEditIcon()}
      </div>
    );
  }

  public render(): React.ReactElement {
    const { address, addressProps, addressWidth, classes, disabled, getBalancesByAddress, onClick } = this.props;

    const newAddressProps = {
      hideCopy: true,
      id: address,
      shortened: true,
      ...addressProps,
    };

    return (
      <div
        className={cx(classes.root, { [classes.clickable]: !disabled })}
        onClick={(event) => !disabled && onClick?.(event)}
      >
        {this.getIdentityIcon()}
        <div className={classes.accountContainer} style={{ width: addressWidth }}>
          {this.getNameField()}
          <Address {...newAddressProps} />
          {getBalancesByAddress != null && (
            <div className={classes.accountBalances}>
              {getBalancesByAddress(address).map((balance, index) => (
                <Typography key={`balance[${index}]`} className={classes.accountBalance} color="secondary">
                  {balance}
                </Typography>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(Account);
