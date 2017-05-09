import React from 'react';
import { connect } from 'react-redux';
import { TableRow, TableRowColumn } from 'material-ui/Table';

import log from 'loglevel';
import { link, tables } from 'lib/styles';

const Render = ({ token, openToken }) => (
    <TableRow selectable={false}>
        <TableRowColumn style={tables.shortStyle}>
                <span onClick={openToken} style={link}>
                    {token.get('name')}
                </span>
        </TableRowColumn>
        <TableRowColumn style={tables.wideStyle}>
                <span onClick={openToken} style={link}>
                    {token.get('address')}
                </span>
        </TableRowColumn>
        <TableRowColumn style={tables.wideStyle}>
                <span onClick={openToken} style={link}>
                    {token.get('total') ? token.get('total').getDecimalized() : '?'} {token.get('symbol')}
                </span>
        </TableRowColumn>
    </TableRow>
    );

const Token = connect(
    (state, ownProps) => ({}),
    (dispatch, ownProps) => ({
        openToken: () => {
            const token = ownProps.token;
            log.debug('open', token.get('id'));
            log.error('TODO: This will go to a screen for interacting with token contract');
            // dispatch(gotoScreen('token', token))
        },
    })
)(Render);


export default Token;
