import React from 'react';
import { connect } from 'react-redux';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import { gotoScreen } from 'store/screenActions';
import log from 'loglevel';
import { link, tables } from 'lib/styles';

const Render = ({ account, openAccount }) => (
        <TableRow selectable={false}>
            <TableRowColumn style={tables.wideStyle}>
                <span onClick={openAccount} style={link}>
                    {account.get('id')}
                </span>
            </TableRowColumn>
            <TableRowColumn style={tables.shortStyle}>
                <span onClick={openAccount} style={link}>
                    {account.get('balance') ? account.get('balance').getEther() : '?'} Ether
                </span>
            </TableRowColumn>
        </TableRow>
    );

const Account = connect(
    (state, ownProps) => ({}),
    (dispatch, ownProps) => ({
        openAccount: () => {
            const account = ownProps.account;
            log.debug('open', account.get('id'));
            dispatch(gotoScreen('account', account));
        },
    })
)(Render);


export default Account;
