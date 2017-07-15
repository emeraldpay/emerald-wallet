import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow } from 'material-ui/Table';
import { tables } from 'lib/styles';
import Addr from './addr';

const Render = ({ addresses }) => {
    const table = <Table >
        <TableHeader>
            <TableRow>
                <TableHeaderColumn style={tables.mediumStyle}>HD Path</TableHeaderColumn>
                <TableHeaderColumn style={tables.wideStyle}>Address</TableHeaderColumn>
                <TableHeaderColumn style={tables.mediumStyle}>Balance</TableHeaderColumn>
            </TableRow>
        </TableHeader>
        <TableBody>
            {addresses.map((addr) => <Addr key={addr.hdpath} addr={addr}/>)}
        </TableBody>
    </Table>;

    return (table)
};

Render.propTypes = {
};

const Component = connect(
    (state, ownProps) => ({
        addresses: state.ledger.get('addresses').toJS()
    }),
    (dispatch, ownProps) => ({
    })
)(Render);

export default Component;
