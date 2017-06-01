import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import { gotoScreen } from 'store/screenActions';
import log from 'loglevel';
import { link, tables } from 'lib/styles';

const Render = ({ account, openAccount }) => (
    <TableRow onClick={openAccount} selectable={false}>
        <TableRowColumn style={tables.shortStyle}>
            <span style={link}>
                {account.get('name') || account.get('id')}
            </span>
        </TableRowColumn>
        <TableRowColumn style={tables.wideStyle}>
            <span style={link}>
                {account.get('id')}
            </span>
        </TableRowColumn>
        <TableRowColumn style={tables.shortStyle}>
            <span style={link}>
                {account.get('balance') ? account.get('balance').getEther() : '?'} Ether
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
