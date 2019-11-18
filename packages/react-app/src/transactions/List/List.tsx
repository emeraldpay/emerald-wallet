import {
  createStyles,
  Table, TableBody, TableCell, TableHead, TableRow
} from '@material-ui/core';
import { withStyles, withTheme } from '@material-ui/styles';
import cx from 'classnames';
import { List } from 'immutable';
import * as React from 'react';
import Transaction from './Transaction';

const styles = createStyles({
  columnName: {
    textTransform: 'uppercase',
    fontSize: '11px !important',
    fontWeight: 500,
    letterSpacing: '1px',
    lineHeight: '16px'
  },
  columnAddresses: {
    paddingLeft: '5px',
    width: '150px'
  },
  amountColumn: {
    paddingLeft: '0 !important',
    width: '100px'
  },
  statusColumn: {
    width: '100px',
    paddingLeft: '0px',
    paddingRight: 'inherit'
  },
  columnArrow: {
    paddingLeft: '0px !important',
    paddingRight: '0px !important',
    width: '24px'
  }
});

interface IProps {
  transactions: List<any>;
  accountId: string;
  theme: any;
  classes: any;
}

const TransactionsList = (props: IProps) => {
  const {
    transactions, accountId, theme, classes
  } = props;
  if (!transactions) {
    return (<div>Loading...</div>);
  }
  if (transactions.size === 0) {
    return (
      <div style={{ paddingTop: '20px', color: theme.palette.text.secondary }}>
        There are no transactions.
      </div>
    );
  }
  return (
    <div>
      <Table style={{ background: theme.palette.primary.contrastText }}>
        <TableHead>
          <TableRow>
            <TableCell className={cx(classes.columnName, classes.amountColumn)}>Amount</TableCell>
            <TableCell className={classes.columnArrow}>&nbsp;</TableCell>
            <TableCell className={cx(classes.columnAddresses, classes.columnName)}>From -> To</TableCell>
            <TableCell className={cx(classes.columnName, classes.statusColumn)}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((tx) => <Transaction key={tx.get('hash')} tx={tx} accountId={accountId} />)}
        </TableBody>
      </Table>
    </div>
  );
};

export default withTheme(withStyles(styles)(TransactionsList));
