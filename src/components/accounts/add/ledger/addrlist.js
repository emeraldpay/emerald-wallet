import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow } from 'material-ui/Table';
import { tables } from 'lib/styles';
import Addr from './addr';
import { selectRows } from 'store/ledgerActions'

const Render = ({ addresses, setSelectedRows }) => {
    const table = <Table onRowSelection={setSelectedRows} multiSelectable={true}>
        <TableHeader>
            <TableRow>
                <TableHeaderColumn style={tables.shortStyle}>HD Path</TableHeaderColumn>
                <TableHeaderColumn style={tables.wideStyle}>Address</TableHeaderColumn>
                <TableHeaderColumn style={tables.mediumStyle}>Balance</TableHeaderColumn>
                <TableHeaderColumn style={tables.shortStyle}>Used</TableHeaderColumn>
            </TableRow>
        </TableHeader>
        <TableBody deselectOnClickaway={false}>
            {addresses.map((addr) => <Addr key={addr.get('hdpath')} addr={addr}/>)}
        </TableBody>
    </Table>;

    return (table)
};

Render.propTypes = {
};

const Component = connect(
    (state, ownProps) => ({
        addresses: state.ledger.get('addresses')
    }),
    (dispatch, ownProps) => ({
        setSelectedRows: (indexes) => {
            dispatch(selectRows(indexes))
        }
    })
)(Render);

export default Component;
