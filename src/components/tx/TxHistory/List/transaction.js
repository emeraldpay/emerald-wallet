// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import { Repeat as RepeatIcon } from 'emerald-js/lib/ui/icons';
import launcher from 'store/launcher';
import accounts from 'store/vault/accounts';
import wallet from 'store/wallet';
import screen from '../../../../store/wallet/screen';
import { refreshTransaction } from '../../../../store/wallet/history/historyActions';
import { link, tables } from '../../../../lib/styles';
import AddressAvatar from '../../../../elements/AddressAvatar/addressAvatar';
import AccountBalance from '../../../accounts/Balance';
import TokenUnits from '../../../../lib/tokenUnits';

const styles = {
  repeatIcon: {
    width: '15px',
    height: '15px',
  },
};

export const Transaction = (props) => {
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
          abbreviated={false}
          primary={fromAccount.get('name')}
          onAddressClick={() => openAccount(tx.get('from'))}
        />
      </TableRowColumn>
      <TableRowColumn style={{...tables.shortestStyle, textOverflow: 'inherit'}}>
        <FontIcon className='fa fa-angle-right' />
      </TableRowColumn>
      <TableRowColumn>
        <AddressAvatar
          addr={tx.get('to')}
          abbreviated={false}
          primary={toAccount.get('name')}
          onAddressClick={() => openAccount(tx.get('to'))}
        />
      </TableRowColumn>
      <TableRowColumn style={{...tables.shortStyle, paddingRight: '0', textAlign: 'right' }}>
        <IconButton onClick={ refreshTx } iconStyle={ styles.repeatIcon }>
          <RepeatIcon />
        </IconButton>
      </TableRowColumn>
    </TableRow>
  );
};

Transaction.propTypes = {
  showFiat: PropTypes.bool,
  tx: PropTypes.object.isRequired,
  openAccount: PropTypes.func.isRequired,
  toAccount: PropTypes.object.isRequired,
  fromAccount: PropTypes.object.isRequired,
  openTx: PropTypes.func.isRequired,
  refreshTx: PropTypes.func.isRequired,
};

export default connect(
  (state, ownProps) => {
    const getAccount = (addr) => {
      const acc = accounts.selectors.selectAccount(state, addr);
      return acc || Immutable.Map({});
    };

    const toAccount = getAccount(ownProps.tx.get('to'));
    const fromAccount = getAccount(ownProps.tx.get('from'));

    return {
      showFiat: launcher.selectors.getChainName(state).toLowerCase() === 'mainnet',
      tx: ownProps.tx,
      toAccount,
      fromAccount,
    };
  },
  (dispatch, ownProps) => ({
    openTx: () => {
      const tx = ownProps.tx;
      dispatch(screen.actions.gotoScreen('transaction', {
        hash: tx.get('hash'),
        accountId: ownProps.accountId,
      })
      );
    },
    openAccount: (address: string) => {
      dispatch(wallet.actions.showAccountDetails(address));
    },
    refreshTx: () => {
      const hash = ownProps.tx.get('hash');
      dispatch(refreshTransaction(hash));
    },
  })
)(Transaction);

