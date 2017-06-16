import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import { gotoScreen } from 'store/screenActions';
import log from 'loglevel';
import { link, tables } from 'lib/styles';
import AccountPopup from './popup';

const Render = ({ account, openAccount }) => (
    <TableRow selectable={false} >
        <TableRowColumn xs={3} >
            <span style={link} onClick={openAccount}>
                {account.get('name')}
            </span>
        </TableRowColumn>
        <TableRowColumn xs={5} >
            <span style={link} onClick={openAccount}>
                {account.get('id')}
            </span>
        </TableRowColumn>
        <TableRowColumn xs={3}>
            <span style={link}>
                {account.get('balance') ? account.get('balance').getEther() : '?'} Ether
            </span>
        </TableRowColumn>
        <TableRowColumn xs={1} >
            <span>
            <AccountPopup account={account}/>
            </span>
        </TableRowColumn>
    </TableRow>
);

Render.propTypes = {
    account: PropTypes.object.isRequired,
    openAccount: PropTypes.func.isRequired,
};

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
