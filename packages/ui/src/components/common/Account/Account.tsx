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
import { WithStyles } from '@material-ui/styles';
import classNames from 'classnames';
import * as React from 'react';
import { Pen3 as EditIcon } from '../../../icons';
import Address from '../Address';
import IdentityIcon from '../IdentityIcon';

export const styles = createStyles({
  root: {
    alignItems: 'center',
    cursor: 'default',
    display: 'flex',
    minHeight: 50,
  },
  clickable: {
    cursor: 'pointer',
  },
  account: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  accountBalances: {
    display: 'flex',
  },
  accountBalance: {
    fontSize: 14,
    '& + &': {
      marginLeft: 5,
    },
  },
  accountName: {
    alignItems: 'center',
    display: 'flex',
  },
  accountNameEdit: {
    marginLeft: 5,
  },
  accountNameEditIcon: {
    cursor: 'pointer',
    height: 13,
    width: 13,
  },
  accountDescription: {
    fontSize: 15,
  },
  accountIdentityIcon: {
    marginRight: 20,
  },
});

interface OwnProps {
  address: string;
  addressProps?: Record<string, unknown>;
  addressWidth?: number | string;
  balances?: string[];
  description?: React.ReactNode;
  disabled?: boolean;
  editable?: boolean;
  identity?: boolean;
  identityProps?: Record<string, unknown>;
  name?: string;
  onClick?(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
  onEditClick?(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
}

class Account extends React.PureComponent<OwnProps & WithStyles<typeof styles>> {
  public static defaultProps = {
    addressWidth: 'auto',
    disabled: false,
    editable: false,
  };

  public render(): React.ReactNode {
    const {
      address,
      addressProps,
      addressWidth,
      balances,
      classes,
      description,
      disabled,
      editable,
      identity,
      name,
      onClick,
      onEditClick,
    } = this.props;

    return (
      <div
        className={classNames(classes.root, { [classes.clickable]: !disabled })}
        onClick={(event) => !disabled && onClick?.(event)}
      >
        {identity != null && (
          <div className={classes.accountIdentityIcon}>
            <IdentityIcon id={address} />
          </div>
        )}
        <div className={classes.account} style={{ width: addressWidth }}>
          {name != null && (
            <div className={classes.accountName}>
              <Typography>{name}</Typography>
              {editable && (
                <div className={classes.accountNameEdit} onClick={onEditClick}>
                  <EditIcon className={classes.accountNameEditIcon} />
                </div>
              )}
            </div>
          )}
          <Address hideCopy shortened address={address} {...addressProps} />
          {description != null && <Typography className={classes.accountDescription}>{description}</Typography>}
          {balances != null && (
            <div className={classes.accountBalances}>
              {balances.map((balance, index) => (
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
