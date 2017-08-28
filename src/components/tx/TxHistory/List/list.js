/* @flow */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow } from 'material-ui/Table';

import { tables } from '../../../../lib/styles';
import Transaction from './transaction';

import classes from './list.scss';

type Props = {
    transactions: any,
};

const TransactionsList = (props: Props) => {
    const { transactions } = props;
    if (!transactions) {
        return (<div>Loading...</div>);
    }
    return (
        <div>
            <Table selectable={ false } fixedHeader={ true }>
                <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
                    <TableRow>
                        <TableHeaderColumn className={ cx(classes.columnName, classes.amountColumn) } >
                            Amount
                        </TableHeaderColumn>
                        <TableHeaderColumn className={classes.columnName} style={tables.mediumStyle}>
                            Status
                        </TableHeaderColumn>
                        <TableHeaderColumn className={classes.columnName}>From</TableHeaderColumn>
                        <TableHeaderColumn style={tables.shortestStyle}>&nbsp;</TableHeaderColumn>
                        <TableHeaderColumn className={classes.columnName}>To</TableHeaderColumn>
                        <TableHeaderColumn style={{...tables.shortestStyle }}/>
                    </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={ false }>
                    { transactions.map((tx) => <Transaction key={tx.get('hash')} tx={tx}/>) }
                </TableBody>
            </Table>
        </div>
    );
};

TransactionsList.propTypes = {
    transactions: PropTypes.object.isRequired,
};


export default TransactionsList;
