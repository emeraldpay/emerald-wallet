// @flow
import React from 'react';
import {withStyles, withTheme} from '@material-ui/styles';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Transaction from './transaction';

const styles2 = {
  columnName: {
    textTransform: 'uppercase',
    fontSize: '11px !important',
    fontWeight: '500 !important',
    letterSpacing: '1px',
    lineHeight: '16px',
  },
  columnAddresses: {
    paddingLeft: '5px',
    width: '150px',
  },
  amountColumn: {
    paddingLeft: '0 !important',
    width: '100px',
  },
  statusColumn: {
    width: '100px',
    paddingLeft: '0px',
    paddingRight: 'inherit',
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

const TransactionsList = (props: Props) => {
  const {
    transactions, accountId, theme, classes,
  } = props;
  if (!transactions) {
    return (<div>Loading...</div>);
  }
  if (transactions.size === 0) {
    return (<div style={{paddingTop: '20px', color: theme.palette.text.secondary}}> There are no transactions. </div>);
  }
  return (
    <div>
      <Table style={{background: theme.palette.primary.contrastText}}>
        <TableHead>
          <TableRow>
            <TableCell className={ cx(classes.columnName, classes.amountColumn) }>Amount</TableCell>
            <TableCell className={classes.columnArrow}>&nbsp;</TableCell>
            <TableCell className={ cx(classes.columnAddresses, classes.columnName) }>From -> To</TableCell>
            <TableCell className={ cx(classes.columnName, classes.statusColumn)}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          { transactions.map((tx) => <Transaction key={tx.get('hash')} tx={tx} accountId={ accountId } />) }
        </TableBody>
      </Table>
    </div>
  );
};

TransactionsList.propTypes = {
  transactions: PropTypes.object.isRequired,
};

export default withTheme(withStyles(styles2)(TransactionsList));
