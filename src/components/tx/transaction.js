import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import { gotoScreen } from 'store/screenActions';
import { refreshTransaction } from 'store/accountActions';
import FontIcon from 'material-ui/FontIcon';
import log from 'loglevel';
import { link, tables } from 'lib/styles';
import { toDuration } from 'lib/convert';
import { AddressAvatar, AccountAddress } from 'elements/dl';
import loading from 'images/loading.gif';
import AccountBalance from '../accounts/balance';
import { Wei } from 'lib/types';

const Render = ({ tx, openTx, openAccount, refreshTx, toAccount, fromAccount }) => {

    return (
        <TableRow selectable={false}>

            <TableRowColumn >
                    <AccountBalance balance={tx.get('value') || new Wei(0)} onClick={openTx} withAvatar={false} />
            </TableRowColumn>

            {/* TODO: move tx status to own component */}
            {/* TODO: timestamp */}
            <TableRowColumn style={{...tables.shortStyle, ...link}} >
                {
                    (() => {
                        if (tx.get('blockNumber')) {
                            return <span style={{color: 'limegreen'}} onClick={openTx}>Success</span>
                        }
                        return <span style={{color: 'gray'}} onClick={openTx}><img src={loading} height={14} />&nbsp; In queue...</span>
                    })()
                }
            </TableRowColumn>

            <TableRowColumn >
                <AddressAvatar
                    secondary={<AccountAddress id={tx.get('from')} abbreviated={true}/>}
                    tertiary={fromAccount.get('description')}
                    primary={fromAccount.get('name')}
                    onClick={() => openAccount(fromAccount)}
                />
            </TableRowColumn>
            <TableRowColumn >
                <FontIcon className='fa fa-arrow-right' />
            </TableRowColumn>
            <TableRowColumn >
                <AddressAvatar
                    secondary={<AccountAddress id={tx.get('to')} abbreviated={true}/>}
                    tertiary={toAccount.get('description')}
                    primary={toAccount.get('name')}
                    onClick={() => openAccount(toAccount)}
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
