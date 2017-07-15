import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TableRowColumn, TableRow } from 'material-ui/Table';
import { tables } from 'lib/styles';
import { AddressAvatar, AccountAddress } from 'elements/dl';
import AccountBalance from '../../balance';
import FontIcon from 'material-ui/FontIcon';

const style = {
    used: {
        color: '#999'
    },
    usedIcon: {
        fontSize: '14px'
    }
};

const Render = ({ addr, ...otherProps }) => {
    let usedDisplay;
    if (addr.get('txcount') > 0) {
        usedDisplay = <span style={style.used}>
            <FontIcon className="fa fa-check-square-o" style={style.usedIcon}/> Used
        </span>
    } else {
        usedDisplay = <span style={style.used}>
            <FontIcon className="fa fa-square-o" style={style.usedIcon} /> New
        </span>
    }

    return (
        <TableRow {...otherProps}>
            {otherProps.children[0] /* checkbox passed down from TableBody*/ }
            <TableRowColumn style={tables.shortStyle}>{addr.get('hdpath')}</TableRowColumn>
            <TableRowColumn style={tables.wideStyle}><AccountAddress id={addr.get('address')}/></TableRowColumn>
            <TableRowColumn style={tables.mediumStyle}>
                <AccountBalance
                    balance={addr.get('value')}
                    showFiat={true} withAvatar={false}
                />
            </TableRowColumn>
            <TableRowColumn style={tables.shortStyle}>
                {usedDisplay}
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
