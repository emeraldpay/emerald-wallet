import React from 'react';
import { connect } from 'react-redux';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { gotoScreen } from '../../store/screenActions';
import log from 'loglevel';
import { link, tables } from 'lib/styles';

const Render = ({address, openAddress}) => {
    return (
        <TableRow selectable={false}>
            <TableRowColumn style={tables.shortStyle}>
                <span onClick={openAddress} style={link}>
                    {address.get('name')}
                </span>
            </TableRowColumn>
            <TableRowColumn style={tables.wideStyle}>
                <span onClick={openAddress} style={link}>
                    {address.get('id')}
                </span>
            </TableRowColumn>
            <TableRowColumn style={tables.shortStyle}>
                <span onClick={openAddress} style={link}>
                    {address.get('balance') ? address.get('balance').getEther() : '?'} Ether
                </span>
            </TableRowColumn>
        </TableRow>
    );
};

const Address = connect(
    (state, ownProps) => {
        return {}
    },
    (dispatch, ownProps) => {
        return {
            openAddress: () => {
                const address = ownProps.address;
                dispatch(gotoScreen('address', address))
            }
        }
    }
)(Render);


export default Address