// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import { IconButton } from 'material-ui';
import CircularProgress from 'material-ui/CircularProgress';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { Account as AddressAvatar } from 'emerald-js-ui';
import { Forward as ArrowRightIcon } from 'emerald-js-ui/lib/icons3';
import { Repeat as RepeatIcon } from 'emerald-js-ui/lib/icons';
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
    paddingBottom: '15px',
  },
};


export const TxView = (props) => {
  const { showFiat, tx, openTx, openAccount, refreshTx, toAccount, fromAccount, numConfirmations, currentBlockHeight, muiTheme } = props;
  const blockNumber = tx.get('blockNumber');
  const confirmationBlockNumber = blockNumber + numConfirmations;
  const successColor = muiTheme.palette.primary1Color;
  // TODO: move tx status to own component
  // TODO: timestamp
  let txStatus = null;
  const numConfirmed = currentBlockHeight - blockNumber;

  if (blockNumber && confirmationBlockNumber > currentBlockHeight) {
    const percent = Math.floor((numConfirmed / numConfirmations) * 100);
    txStatus = (
      <div>
        <div style={{color: successColor}} onClick={ openTx }>Success ({percent}%)</div>
        <div style={{fontSize: '9px'}} onClick={ openTx }>{numConfirmed} / {numConfirmations} confirmations</div>
      </div>
    );
  } else if (blockNumber && confirmationBlockNumber <= currentBlockHeight) {
    txStatus = (
      <span style={{color: successColor}} onClick={ openTx }>Success</span>
    );
  } else {
    txStatus = (
      <span style={{color: muiTheme.palette.primary3Color}} onClick={ openTx }>
        <CircularProgress color={muiTheme.palette.textColor} size={15} thickness={1.5}/> In Queue
      </span>
    );
  }

  const txValue = tx.get('value') ? new TokenUnits(tx.get('value'), 18) : null;

  const fiatStyle = {
    fontSize: '16px',
    lineHeight: '19px',
    color: muiTheme.palette.secondaryTextColor,
  };

  return (
    <TableRow selectable={false}>
      <TableRowColumn style={{ width: 80, paddingLeft: '0', ...styles.tablePadding }}>
        {txValue && <AccountBalance
          fiatStyle={fiatStyle}
          symbol="ETC"
          showFiat={ showFiat }
          balance={ txValue }
          onClick={ openTx }
          withAvatar={ false }
        /> }
      </TableRowColumn>
      <TableRowColumn style={{width: 60, ...link, ...styles.tablePadding}} >
        { txStatus }
      </TableRowColumn>
      <TableRowColumn style={{paddingLeft: '5px'}}>
        <AddressAvatar
          addr={tx.get('from')}
          primary={fromAccount.get('name')}
          onAddressClick={() => openAccount(tx.get('from'))}
        />
      </TableRowColumn>
      <TableRowColumn className={classes.columnArrow} style={{textOverflow: 'inherit', ...styles.tablePadding}}>
        <ArrowRightIcon style={{color: muiTheme.palette.secondaryTextColor}} />
      </TableRowColumn>
      <TableRowColumn style={{paddingLeft: '5px', ...styles.tablePadding}}>
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
  currentBlockHeight: PropTypes.number.isRequired,
  numConfirmations: PropTypes.number.isRequired,
};

export default muiThemeable()(TxView);
