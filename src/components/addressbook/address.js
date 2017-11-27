import React from 'react';
import { connect } from 'react-redux';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import { link, tables } from 'lib/styles';
import { gotoScreen } from '../../store/wallet/screen/screenActions';

const Render = ({ address, openAddress }) => (
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

const Address = connect(
  (state, ownProps) => ({}),
  (dispatch, ownProps) => ({
    openAddress: () => {
      const address = ownProps.address;
      dispatch(gotoScreen('address', address.get('id')));
    },
  })
)(Render);


export default Address;
