import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TableRowColumn, TableRow } from 'material-ui/Table';
import { tables } from 'lib/styles';
import { AddressAvatar, AccountAddress } from 'elements/dl';

const Render = ({ addr, ...otherProps }) => {
    return (
        <TableRow {...otherProps}>
            {otherProps.children[0] /* checkbox passed down from TableBody*/ }
            <TableRowColumn style={tables.mediumStyle}>{addr.hdpath}</TableRowColumn>
            <TableRowColumn style={tables.wideStyle}><AccountAddress id={addr.address}/></TableRowColumn>
            <TableRowColumn style={tables.mediumStyle}>0</TableRowColumn>
        </TableRow>
    )
};

Render.propTypes = {
};

const Component = connect(
    (state, ownProps) => ({
    }),
    (dispatch, ownProps) => ({
    })
)(Render);

export default Component;
