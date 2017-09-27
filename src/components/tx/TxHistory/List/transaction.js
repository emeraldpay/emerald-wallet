import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import { Wei } from 'emerald-js';

import { gotoScreen } from '../../../../store/wallet/screen/screenActions';
import { refreshTransaction } from '../../../../store/wallet/history/historyActions';
import { link, tables } from '../../../../lib/styles';
import AddressAvatar from '../../../../elements/AddressAvatar/addressAvatar';
import AccountBalance from '../../../accounts/Balance';
import { RepeatIcon } from '../../../../elements/Icons';
import TokenUnits from '../../../../lib/tokenUnits'

export const Transaction = ({ tx, openTx, openAccount, refreshTx, toAccount, fromAccount }) => {

    // TODO: move tx status to own component
    // TODO: timestamp
    let blockNumber = null;
    if (tx.get('blockNumber')) {
        blockNumber = <span style={{color: 'limegreen'}} onClick={ openTx }>Success</span>;
    } else {
        blockNumber = <span style={{color: 'gray'}} onClick={ openTx }>
            <FontIcon className="fa fa-spin fa-spinner"/> In queue...
        </span>;
    }

    const txValue = tx.get('value') ? new TokenUnits(tx.get('value').value(), 18) : null;

    return (
        <TableRow selectable={false}>

            <TableRowColumn style={{ ...tables.mediumStyle, paddingLeft: '0' }}>
                {txValue && <AccountBalance balance={ txValue } onClick={ openTx } withAvatar={ false } /> }
            </TableRowColumn>

            <TableRowColumn style={{...tables.mediumStyle, ...link}} >
                { blockNumber }
            </TableRowColumn>

            <TableRowColumn>
                <AddressAvatar
                    addr={tx.get('from')}
                    abbreviated={false}
                    tertiary={fromAccount.get('description')}
                    primary={fromAccount.get('name')}
                    onAddressClick={() => openAccount(fromAccount)}
                />
            </TableRowColumn>
            <TableRowColumn style={{...tables.shortestStyle, textOverflow: 'inherit'}}>
                <FontIcon className='fa fa-angle-right' />
            </TableRowColumn>
            <TableRowColumn>
                <AddressAvatar
                    addr={tx.get('to')}
                    abbreviated={false}
                    tertiary={toAccount.get('description')}
                    primary={toAccount.get('name')}
                    onAddressClick={() => openAccount(toAccount)}
                />
            </TableRowColumn>
            <TableRowColumn style={{...tables.shortStyle, paddingRight: '0', textAlign: 'right' }}>
                <IconButton onClick={ refreshTx }>
                    <RepeatIcon />
                </IconButton>
            </TableRowColumn>
        </TableRow>
    );
};

Transaction.propTypes = {
    tx: PropTypes.object.isRequired,
    openAccount: PropTypes.func.isRequired,
    toAccount: PropTypes.object.isRequired,
    fromAccount: PropTypes.object.isRequired,
    openTx: PropTypes.func.isRequired,
    refreshTx: PropTypes.func.isRequired,
};

export default connect(
    (state, ownProps) => {
        const accounts = state.accounts.get('accounts', Immutable.List());

        const getAccount = (addr) => {
            if (typeof addr !== 'string') {
                return Immutable.Map({});
            }
            const pos = accounts.findKey((acc) => acc.get('id') === addr);
            return (pos >= 0) ? accounts.get(pos) : Immutable.Map({});
        };

        const toAccount = getAccount(ownProps.tx.get('to'));
        const fromAccount = getAccount(ownProps.tx.get('from'));

        return {
            tx: ownProps.tx,
            getAccount,
            toAccount,
            fromAccount,
        };
    },
    (dispatch, ownProps) => ({
        openTx: () => {
            const tx = ownProps.tx;
            dispatch(gotoScreen('transaction', {
                hash: tx.get('hash'),
            })
            );
        },
        openAccount: (acc) => {
            dispatch(gotoScreen('account', acc));
        },
        refreshTx: () => {
            const hash = ownProps.tx.get('hash');
            dispatch(refreshTransaction(hash));
        },
    })
)(Transaction);

