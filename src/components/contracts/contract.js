import React from 'react';
import { connect } from 'react-redux';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import { link, tables } from 'lib/styles';
import { gotoScreen } from '../../store/wallet/screen/screenActions';

const Render = ({ contract, openContract }) => (
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

const Contract = connect(
  (state, ownProps) => ({}),
  (dispatch, ownProps) => ({
    openContract: () => {
      const contract = ownProps.contract;
      dispatch(gotoScreen('contract', contract));
    },
  })
)(Render);


export default Contract;
