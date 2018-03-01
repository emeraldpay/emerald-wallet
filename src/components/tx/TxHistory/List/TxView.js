// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import { FontIcon, IconButton } from 'material-ui';
import CircularProgress from 'material-ui/CircularProgress';
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
  tablePadding: {
    paddingTop: '15px',
    paddingBottom: '15px'
  }
};


export const TxView = (props) => {
  const { showFiat, tx, openTx, openAccount, refreshTx, toAccount, fromAccount } = props;
  // TODO: move tx status to own component
  // TODO: timestamp
  let txStatus = null;
  if (tx.get('blockNumber') && ) {
    txStatus = <span style={{color: 'limegreen'}} onClick={ openTx }>Success</span>;
  } else {
    txStatus = <span style={{color: 'gray'}} onClick={ openTx }>
      <CircularProgress color="black" size={15} thickness={1.5}/> In Queue
    </span>;
  }

  const txValue = tx.get('value') ? new TokenUnits(tx.get('value'), 18) : null;

  return (
    <TableRow selectable={false}>
      <TableRowColumn style={{ ...tables.mediumStyle, paddingLeft: '0', ...styles.tablePadding }}>
        {txValue && <AccountBalance
          symbol="ETC"
          showFiat={ showFiat }
          balance={ txValue }
          onClick={ openTx }
          withAvatar={ false }
        /> }
      </TableRowColumn>
      <TableRowColumn style={{...tables.mediumStyle, ...link, ...styles.tablePadding}} >
        { txStatus }
      </TableRowColumn>
      <TableRowColumn>
        <AddressAvatar
          addr={tx.get('from')}
          primary={fromAccount.get('name')}
          onAddressClick={() => openAccount(tx.get('from'))}
        />
      </TableRowColumn>
      <TableRowColumn className={classes.columnArrow} style={{textOverflow: 'inherit', ...styles.tablePadding}}>
        <ArrowRightIcon color="#DDDDDD" />
      </TableRowColumn>
      <TableRowColumn style={styles.tablePadding}>
        {tx.get('to') &&
        <AddressAvatar
          addr={tx.get('to')}
          primary={toAccount.get('name')}
          onAddressClick={() => openAccount(tx.get('to'))}
        />}
      </TableRowColumn>
      <TableRowColumn style={{...tables.shortStyle, paddingRight: '0', textAlign: 'right', ...styles.tablePadding}}>
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
  currentBlock: PropTypes.string.isRequired
};
