import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import FontIcon from 'material-ui/FontIcon';
import { gotoScreen } from 'store/screenActions';
import log from 'loglevel';
import copy from 'copy-to-clipboard';
import { link, tables, copyIcon } from 'lib/styles';
import AccountPopup from './popup';

const Render = ({ account, openAccount }) => {
    function copyAccountToClipBoard() {
        copy(account.get('id'));
    }

    return (
    <TableRow selectable={false} >
        <TableRowColumn >
            <span style={link} onClick={openAccount}>
                {account.get('name')}
            </span>
        </TableRowColumn>
        <TableRowColumn >
            <FontIcon className='fa fa-clone' onClick={copyAccountToClipBoard} style={copyIcon} />
            <span style={link} onClick={openAccount}>
                {account.get('id')}
            </span>
        </TableRowColumn>
        <TableRowColumn>
            <span style={link}>
                {account.get('balance') ? account.get('balance').getEther() : '?'} Ether
            </span>
        </TableRowColumn>
        <TableRowColumn >
            <span>
            <AccountPopup account={account}/>
            </span>
        </TableRowColumn>
    </TableRow>);
};

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
