import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow } from 'material-ui/Table';
import { tables } from 'lib/styles';
import ledger from 'store/ledger/index';
import Addr from './addr';


const Render = ({ addresses, setSelectedRows }) => {
    const table = <Table onRowSelection={ setSelectedRows }>
        <TableHeader>
            <TableRow>
                <TableHeaderColumn style={tables.shortStyle}>HD Path</TableHeaderColumn>
                <TableHeaderColumn style={tables.wideStyle}>Address</TableHeaderColumn>
                <TableHeaderColumn style={tables.mediumStyle}>Balance</TableHeaderColumn>
                <TableHeaderColumn style={tables.shortStyle}>Status</TableHeaderColumn>
            </TableRow>
        </TableHeader>
        <TableBody deselectOnClickaway={false}>
            {addresses.map((addr) => <Addr key={addr.get('hdpath')} addr={addr}/>)}
        </TableBody>
    </Table>;

    return (table);
};

Render.propTypes = {
};

export default connect(
    (state, ownProps) => ({
        addresses: state.ledger.get('addresses'),
    }),
    (dispatch, ownProps) => ({
        setSelectedRows: (indexes) => {
            dispatch(ledger.actions.selectRows(indexes));
        },
    })
)(Render);
