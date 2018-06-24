// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Wei, convert } from 'emerald-js';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import CircularProgress from 'material-ui/CircularProgress';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { Account as AddressAvatar } from 'emerald-js-ui';
import { Forward as ArrowRightIcon } from 'emerald-js-ui/lib/icons3';
import AccountBalance from '../../../accounts/Balance';
import TokenUnits from '../../../../lib/tokenUnits';
import { link, tables } from '../../../../lib/styles';
import classes from './list.scss';
import i18n from '../../../../i18n/i18n';
import { TokenAbi } from '../../../../lib/erc20';

const InputDataDecoder = require('ethereum-input-data-decoder');

const decoder = new InputDataDecoder(TokenAbi);

const styles = {
  tablePadding: {
    paddingTop: '15px',
    paddingBottom: '15px',
  },
};


export const TxView = (props) => {
  const { token, showFiat, tx, openTx, openAccount, toAccount, fromAccount, numConfirmations, currentBlockHeight, muiTheme } = props;
  const blockNumber = tx.get('blockNumber');
  const confirmationBlockNumber = blockNumber + numConfirmations;
  const successColor = muiTheme.palette.primary1Color;
  // TODO: move tx status to own component
  // TODO: timestamp
  let txStatus = null;
  const numConfirmed = Math.max(currentBlockHeight - blockNumber, 0);

  const timestampEvent = new Date(tx.get('timestamp') * 1000);
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };
  const ts = timestampEvent.toLocaleDateString(i18n.languange, options);

  if (blockNumber && confirmationBlockNumber > currentBlockHeight) {
    txStatus = (
      <div>
        <div style={{color: successColor}} onClick={ openTx }>Success</div>
        <div style={{fontSize: '9px', textAlign: 'center'}} onClick={ openTx }>{numConfirmed} / {numConfirmations}</div>
      </div>
    );
  } else if (blockNumber && confirmationBlockNumber <= currentBlockHeight) {
    txStatus = (
      <div>
        <span style={{color: successColor}} onClick={ openTx }>Success</span> <br />
        <span style={{fontSize: '9px', color: muiTheme.palette.secondaryTextColor}} onClick={ openTx }>{ts}</span>
      </div>
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
  let symbol = 'ETC';
  let balance = txValue;

  if (token) {
    const decodedTxData = decoder.decodeData(tx.get('data'));
    symbol = token.get('symbol');
    if (decodedTxData.inputs.length > 0) {
      const decimals = token.get('decimals');
      let d = 18;
      if (decimals) {
        d = convert.toBigNumber(decimals);
      }
      balance = new TokenUnits(decodedTxData.inputs[1].toString(), d);
    }
  }

  return (
    <TableRow selectable={false}>
      <TableRowColumn style={{ width: 100, paddingLeft: '0', ...styles.tablePadding }}>
        {txValue && <AccountBalance
          fiatStyle={fiatStyle}
          symbol={ symbol }
          showFiat={ showFiat }
          balance={ balance }
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
  currentBlockHeight: PropTypes.number.isRequired,
  numConfirmations: PropTypes.number.isRequired,
};

export default muiThemeable()(TxView);
