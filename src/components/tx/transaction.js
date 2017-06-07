import React from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import { gotoScreen } from 'store/screenActions';
import { refreshTransactions } from 'store/accountActions';
import FontIcon from 'material-ui/FontIcon';
import log from 'loglevel';
import { link, tables } from 'lib/styles';
import { toDuration } from 'lib/convert';

const Render = ({ tx, openTx, accounts, openAccount, refreshTx }) => {

    const accountRow = (addr) => {
        const pos = accounts.findKey((acc) => acc.get('id') === addr);
        const account = (pos >= 0) ? accounts.get(pos) : null;
        return (
            <div>
                {account && <span onClick={() => openAccount(account)} style={link}>
                            {addr} </span>}
                {!account && <span> {addr} </span>}
            </div>
        );
    };


    return (
        <TableRow selectable={false}>
            <TableRowColumn style={tables.shortStyle}>
                    <span onClick={openTx} style={link}>
                        {tx.get('value') ? tx.get('value').getEther() : '?'} Ether
                    </span>
            </TableRowColumn>
            <TableRowColumn style={tables.shortStyle}>
                    <span onClick={openTx} style={link}>
                        {tx.get('timestamp') ? toDuration(tx.get('timestamp')) : 'pending'}
                    </span>
            </TableRowColumn>
            <TableRowColumn style={tables.wideStyle}>
                    {accountRow(tx.get('from'))}
            </TableRowColumn>
            <TableRowColumn style={tables.wideStyle}>
                    <span>
                        {tx.get('to')}
                    </span>
            </TableRowColumn>
            <TableRowColumn style={tables.shortStyle}>
                    <span onClick={refreshTx} style={link}>
                        <FontIcon className="fa fa-refresh fa-2x" />
                    </span>
            </TableRowColumn>        
        </TableRow>
    );
}

const Transaction = connect(
    (state, ownProps) => {
        const accounts = state.accounts.get('accounts', Immutable.List());
        return {
            tx: ownProps.tx,
            accounts,
        };
    },
    (dispatch, ownProps) => ({
        openTx: () => {
            const tx = ownProps.tx;
            dispatch(gotoScreen('transaction', tx));
        },
        openAccount: (acc) => {
            dispatch(gotoScreen('account', acc));
        },
        refreshTx: () => {
            const hash = ownProps.tx.get('hash');
            dispatch(refreshTransactions(hash));
        }
    })
)(Render);


export default Transaction;
