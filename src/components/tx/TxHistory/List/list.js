// @flow
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow } from 'material-ui/Table';
import muiThemeable from 'material-ui/styles/muiThemeable';

import { tables } from '../../../../lib/styles';
import Transaction from './transaction';

const styles = {
  columnName: {
    textTransform: 'uppercase',
    fontSize: '11px !important',
    fontWeight: '500 !important',
    letterSpacing: '1px',
    lineHeight: '16px',
  },

  amountColumn: {
    paddingLeft: '0 !important',
    width: '100px',
  },

  columnArrow: {
    paddingLeft: '0px !important',
    paddingRight: '0px !important',
    width: '24px',
  },
};

type Props = {
    transactions: Array<any>,
    accountId: string,
};

const renderEmptyTransactions = (transactions, muiTheme) => {
  if (transactions.size === 0) {
    return (
      <div style={{paddingTop: '20px', color: muiTheme.palette.secondaryTextColor}}> There are no transactions. </div>
    );
  }
  return null;
};

const TransactionsList = (props: Props) => {
  const { transactions, accountId, muiTheme } = props;
  if (!transactions) {
    return (<div>Loading...</div>);
  }
  return (
    <div>
      <Table selectable={ false } fixedHeader={ true } style={{background: muiTheme.palette.alternateTextColor}}>
        <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
          <TableRow>
            <TableHeaderColumn style={ cx(styles.columnName, styles.amountColumn) } style={{width: 100}} >
                            Amount
            </TableHeaderColumn>
            <TableHeaderColumn style={styles.columnName} style={{ width: 60 }}>
                            Status
            </TableHeaderColumn>
            <TableHeaderColumn style={styles.columnName} style={{paddingLeft: '5px'}}>From</TableHeaderColumn>
            <TableHeaderColumn style={styles.columnArrow}>&nbsp;</TableHeaderColumn>
            <TableHeaderColumn style={styles.columnName} style={{paddingLeft: '5px'}}>To</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={ false }>
          { transactions.map((tx) => <Transaction key={tx.get('hash')} tx={tx} accountId={ accountId } />) }
          { renderEmptyTransactions(transactions, muiTheme) }
        </TableBody>
      </Table>
    </div>
  );
};

TransactionsList.propTypes = {
  transactions: PropTypes.object.isRequired,
};


export default muiThemeable()(TransactionsList);
