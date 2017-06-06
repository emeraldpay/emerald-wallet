import React from 'react';
import { connect } from 'react-redux';
import { TableRow, TableRowColumn } from 'material-ui/Table';

import log from 'loglevel';
import { link, tables } from 'lib/styles';

const Render = ({ tx, openTx }) => (
    <TableRow selectable={false}>
        <TableRowColumn style={tables.shortStyle}>
                <span onClick={openTx} style={link}>
                    {tx.get('value')}
                </span>
        </TableRowColumn>
        <TableRowColumn style={tables.shortStyle}>
                <span onClick={openTx} style={link}>
                    {tx.get('timestamp')}
                </span>
        </TableRowColumn>
        <TableRowColumn style={tables.wideStyle}>
                <span onClick={openAccount} style={link}>
                    {tx.get('from')}
                </span>
        </TableRowColumn>
        <TableRowColumn style={tables.wideStyle}>
                <span onClick={openAccount} style={link}>
                    {tx.get('to')}
                </span>
        </TableRowColumn>
        <TableRowColumn style={tables.shortStyle}>
                <span onClick={refreshTx}>
                    Refresh
                </span>
        </TableRowColumn>        
    </TableRow>
    );

const Transaction = connect(
    (state, ownProps) => ({}),
    (dispatch, ownProps) => ({
        openTx: () => {
            const tx = ownProps.tx;
            dispatch(gotoScreen('transaction', tx));
        },
    })
)(Render);


export default Transaction;
