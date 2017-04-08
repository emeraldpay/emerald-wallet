import React from 'react';
import { connect } from 'react-redux';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { gotoScreen } from '../../store/screenActions';
import log from 'loglevel';
import { link, tables } from 'lib/styles';

const Render = ({contract, openContract}) => {
    return (
        <TableRow selectable={false}>
            <TableRowColumn style={tables.shortStyle}>
                <span onClick={openContract} style={link}>
                    {contract.get('name')}
                </span>
            </TableRowColumn>
            <TableRowColumn style={tables.wideStyle}>
                <span onClick={openContract} style={link}>
                    {contract.get('address')}
                </span>
            </TableRowColumn>
        </TableRow>
    );
};

const Contract = connect(
    (state, ownProps) => {
        return {}
    },
    (dispatch, ownProps) => {
        return {
            openAccount: () => {
                const contract = ownProps.contract;
                console.log("Go to contract interaction page")
                //dispatch(gotoScreen('contract', contract))
            }
        }
    }
)(Render);


export default Contract