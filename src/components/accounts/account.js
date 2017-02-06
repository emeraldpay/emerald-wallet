import React from 'react';
import { connect } from 'react-redux'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'

const shortStyle = { width: 12 };
const wideStyle = { width: 120 };

const Render = ({account}) => {
    return (
        <TableRow selectable={false}>
            <TableRowColumn style={wideStyle}>{account.get('id')}</TableRowColumn>
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
        return {}
    }
)(Render);


export default Account