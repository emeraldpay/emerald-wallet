// @flow
import React from 'react';
import withStyles from 'react-jss';
import PropTypes from 'prop-types';
import { convert, InputDataDecoder } from '@emeraldplatform/core';
import { abi as TokenAbi } from '@emeraldwallet/erc20';
import CircularProgress from '@material-ui/core/CircularProgress';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { Account as AddressAvatar } from '@emeraldplatform/ui';
import { Forward as ArrowRightIcon } from '@emeraldplatform/ui-icons';
import AccountBalance from '../../../accounts/Balance';
import TokenUnits from '../../../../lib/tokenUnits';
import i18n from '../../../../i18n/i18n';

const decoder = new InputDataDecoder(TokenAbi);

export const styles2 = {
  columnArrow: {
    paddingLeft: '0px !important',
    paddingRight: '0px !important',
    paddingTop: '15px',
    paddingBottom: '15px',
    width: '24px',
    textOverflow: 'inherit',
  },
  columnValue: {
    width: 100,
    paddingLeft: '0',
    paddingTop: '15px',
    paddingBottom: '15px',
  },
  columnStatus: {
    width: 60,
    cursor: 'pointer',
    paddingTop: '15px',
    paddingBottom: '15px',
  },
  columnFrom: {
    paddingLeft: '5px',
  },
  columnTo: {
    paddingTop: '15px',
    paddingBottom: '15px',
    paddingLeft: '5px',
  },
};

export const TxView = (props) => {
  const {
    token, showFiat, tx, openTx, openAccount, toAccount, fromAccount, numConfirmations, currentBlockHeight, muiTheme,
  } = props;
  const { classes } = props;
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
  const timeStamp = timestampEvent.toLocaleDateString(i18n.languange, options);

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
        <span style={{fontSize: '9px', color: muiTheme.palette.secondaryTextColor}} onClick={ openTx }>{timeStamp}</span>
      </div>
    );
  } else {
    txStatus = (
      <span style={{color: muiTheme.palette.primary3Color}} onClick={ openTx }>
        <CircularProgress color="secondary" size={15} thickness={1.5}/> In Queue
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
      <TableCell className={classes.columnValue}>
        {txValue && <AccountBalance
          fiatStyle={fiatStyle}
          symbol={ symbol }
          showFiat={ showFiat }
          balance={ balance }
          onClick={ openTx }
          withAvatar={ false }
        /> }
      </TableCell>
      <TableCell className={classes.columnStatus} >
        { txStatus }
      </TableCell>
      <TableCell className={classes.columnFrom}>
        <AddressAvatar
          address={tx.get('from')}
          primary={fromAccount.get('name')}
          onAddressClick={() => openAccount(tx.get('from'))}
        />
      </TableCell>
      <TableCell className={classes.columnArrow}>
        <ArrowRightIcon color="secondary"/>
      </TableCell>
      <TableCell className={classes.columnTo}>
        {tx.get('to')
        && <AddressAvatar
          address={tx.get('to')}
          primary={toAccount.get('name')}
          onAddressClick={() => openAccount(tx.get('to'))}
        />}
      </TableCell>
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

const StyledTxView = withStyles(styles2)(TxView);
export default muiThemeable()(StyledTxView);
