import React from 'react';
import { connect } from 'react-redux'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'
import { open } from '../../store/screenActions'
import log from 'loglevel'

const shortStyle = { width: 12 };
const wideStyle = { width: 120 };

const Render = ({account, openAccount}) => {
    return (
        <TableRow selectable={false}>
            <TableRowColumn style={wideStyle}>
                <span onClick={openAccount}>{account.get('id')}</span>
            </TableRowColumn>
            <TableRowColumn style={shortStyle}>
                {account.get('balance') ? account.get('balance').getEther() : '?'} Ether
            </TableRowColumn>
        </TableRow>
    );
};

const Account = connect(
    (state, ownProps) => {
        return {}
    },
    (dispatch, ownProps) => {
        return {
            openAccount: () => {
                const account = ownProps.account;
                log.debug('open', account.get('id'));
                dispatch(open('account', account))
            }
        }
    }
)(Render);


export default Account