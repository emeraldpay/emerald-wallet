import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import { gotoScreen } from 'store/screenActions';
import { refreshTransaction } from 'store/accountActions';
import FontIcon from 'material-ui/FontIcon';
import log from 'electron-log';
import { link, tables } from 'lib/styles';
import { toDuration } from 'lib/convert';
import AccountAddress from 'elements/AccountAddress';
import AddressAvatar from 'elements/addressAvatar';

import loading from 'images/loading.gif';
import AccountBalance from '../accounts/AccountBalance';
import { Wei } from 'lib/types';

const Render = ({ tx, openTx, openAccount, refreshTx, toAccount, fromAccount }) => {

    {/* TODO: move tx status to own component */}
    {/* TODO: timestamp */}
    let blockNumber = null;
    if (tx.get('blockNumber')) {
        blockNumber = <span style={{color: 'limegreen'}} onClick={openTx}>Success</span>;
    } else {
        blockNumber = <span style={{color: 'gray'}} onClick={openTx}>
            <FontIcon className="fa fa-spin fa-spinner"/> In queue...
        </span>;
    }

    return (
        <TableRow selectable={false}>

            <TableRowColumn style={tables.mediumStyle}>
                <AccountBalance balance={tx.get('value') || new Wei(0)} onClick={openTx} withAvatar={false} />
            </TableRowColumn>

            <TableRowColumn style={{...tables.mediumStyle, ...link}} >
                {blockNumber}
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
            <TableRowColumn style={tables.shortestStyle}>
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
        </TableRow>
    );
};

Render.propTypes = {
    tx: PropTypes.object.isRequired,
    openAccount: PropTypes.func.isRequired,
    toAccount: PropTypes.object.isRequired,
    fromAccount: PropTypes.object.isRequired,
    openTx: PropTypes.func.isRequired,
    refreshTx: PropTypes.func.isRequired,
};

const Transaction = connect(
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
)(Render);


export default Transaction;
