// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import { FontIcon, IconButton } from 'material-ui';
import { Account as AddressAvatar } from 'emerald-js-ui';
import { ArrowRight as ArrowRightIcon, Repeat as RepeatIcon } from 'emerald-js-ui/lib/icons';
import AccountBalance from '../../../accounts/Balance';
import TokenUnits from '../../../../lib/tokenUnits';
import { link, tables } from '../../../../lib/styles';

import classes from './list.scss';

const styles = {
  repeatIcon: {
    width: '15px',
    height: '15px',
  },
};


export const TxView = (props) => {
  const { showFiat, tx, openTx, openAccount, refreshTx, toAccount, fromAccount } = props;
  // TODO: move tx status to own component
  // TODO: timestamp
  let txStatus = null;
  if (tx.get('blockNumber')) {
    txStatus = <span style={{color: 'limegreen'}} onClick={ openTx }>Success</span>;
  } else {
    txStatus = <span style={{color: 'gray'}} onClick={ openTx }>
      <FontIcon className="fa fa-spin fa-spinner"/> In queue...
    </span>;
  }

  const txValue = tx.get('value') ? new TokenUnits(tx.get('value').value(), 18) : null;

  return (
    <TableRow selectable={false}>
      <TableRowColumn style={{ ...tables.mediumStyle, paddingLeft: '0' }}>
        {txValue && <AccountBalance
          symbol="ETC"
          showFiat={ showFiat }
          balance={ txValue }
          onClick={ openTx }
          withAvatar={ false }
        /> }
      </TableRowColumn>
      <TableRowColumn style={{...tables.mediumStyle, ...link}} >
        { txStatus }
      </TableRowColumn>
      <TableRowColumn>
        <AddressAvatar
          addr={tx.get('from')}
          primary={fromAccount.get('name')}
          onAddressClick={() => openAccount(tx.get('from'))}
        />
      </TableRowColumn>
      <TableRowColumn className={classes.columnArrow} style={{textOverflow: 'inherit'}}>
        <ArrowRightIcon color="#DDDDDD" />
      </TableRowColumn>
      <TableRowColumn>
        {tx.get('to') &&
        <AddressAvatar
          addr={tx.get('to')}
          primary={toAccount.get('name')}
          onAddressClick={() => openAccount(tx.get('to'))}
        />}
      </TableRowColumn>
      <TableRowColumn style={{...tables.shortStyle, paddingRight: '0', textAlign: 'right' }}>
        <IconButton onClick={ refreshTx } iconStyle={ styles.repeatIcon }>
          <RepeatIcon />
        </IconButton>
      </TableRowColumn>
    </TableRow>
  );
};

TxView.propTypes = {
  showFiat: PropTypes.bool,
  tx: PropTypes.object.isRequired,
  openAccount: PropTypes.func.isRequired,
  toAccount: PropTypes.object.isRequired,
  fromAccount: PropTypes.object.isRequired,
  openTx: PropTypes.func.isRequired,
  refreshTx: PropTypes.func.isRequired,
};
