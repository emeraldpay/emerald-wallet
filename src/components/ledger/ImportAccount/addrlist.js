import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Table, TableBody, TableHeader, TableHeaderColumn, TableRow
} from 'material-ui/Table';
import { tables } from 'lib/styles';
import ledger from '../../../store/ledger';
import Addr from './addr';

class AddrList extends React.Component {
    handleAddrSelection = (value) => {
      if (this.props.setSelectedAddr) {
        this.props.setSelectedAddr(value);
      }
    };

    render() {
      const { addresses, selectedAddress } = this.props;
      return (
        <Table selectable={ false }>
          <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
            <TableRow>
              <TableHeaderColumn style={tables.wideStyle}>ADDRESS</TableHeaderColumn>
              <TableHeaderColumn style={tables.mediumStyle}>HD PATH</TableHeaderColumn>
              <TableHeaderColumn style={tables.mediumStyle}>BALANCE</TableHeaderColumn>
              <TableHeaderColumn style={tables.shortStyle}>STATUS</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody deselectOnClickaway={ false }>
            { addresses.map((addr) => <Addr
              selectedValue={ selectedAddress }
              onSelected={ this.handleAddrSelection }
              key={ addr.get('hdpath') }
              addr={ addr }
            />)}
          </TableBody>
        </Table>
      );
    }
}

export default connect(
  (state, ownProps) => ({
    selectedAddress: state.ledger.get('selectedAddr'),
    addresses: state.ledger.get('addresses'),
  }),
  (dispatch, ownProps) => ({
    setSelectedAddr: (addr) => {
      dispatch(ledger.actions.selectAddr(addr));
    },
  })
)(AddrList);
