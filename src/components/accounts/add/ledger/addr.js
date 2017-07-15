import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TableRowColumn, TableRow } from 'material-ui/Table';
import { tables } from 'lib/styles';
import { AddressAvatar, AccountAddress } from 'elements/dl';
import AccountBalance from '../../balance';

const Render = ({ addr, ...otherProps }) => {
    return (
        <TableRow {...otherProps}>
            {otherProps.children[0] /* checkbox passed down from TableBody*/ }
            <TableRowColumn style={tables.mediumStyle}>{addr.get('hdpath')}</TableRowColumn>
            <TableRowColumn style={tables.wideStyle}><AccountAddress id={addr.get('address')}/></TableRowColumn>
            <TableRowColumn style={tables.mediumStyle}>
                <AccountBalance
                    balance={addr.get('value')}
                    showFiat={true} withAvatar={false}
                />
            </TableRowColumn>
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
