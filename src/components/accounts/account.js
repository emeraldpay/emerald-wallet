import React from 'react';
import { connect } from 'react-redux'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'
import { open } from '../../store/screenActions'
import log from 'loglevel'
import { link } from '../../lib/styles'

const shortStyle = { width: 12 };
const wideStyle = { width: 120 };

const Render = ({account, openAccount}) => {
    return (
        <TableRow selectable={false}>
            <TableRowColumn style={wideStyle}>
                <span onClick={openAccount} style={link}>
                    {account.get('id')}
                </span>
            </TableRowColumn>
            <TableRowColumn style={shortStyle}>
                <span onClick={openAccount} style={link}>
                    {account.get('balance') ? account.get('balance').getEther() : '?'} Ether
                </span>
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