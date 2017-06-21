import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow } from 'material-ui/Table';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import FontIcon from 'material-ui/FontIcon';
import Avatar from 'material-ui/Avatar';
import log from 'loglevel';
import { cardSpace, tables, noShadow, grayBackground } from 'lib/styles';
import Immutable from 'immutable';
import Transaction from './transaction';

const Render = ({ transactions }) => {
    const styles = {
        root: {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
        },
        titleStyle: {
            fontSize: '20px',
        },
    };

    const table = <Table style={{...grayBackground, ...{tableLayout: 'auto'}}} selectable={false} fixedHeader={true}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
                <TableHeaderColumn >Amount</TableHeaderColumn> {/* style={tables.mediumStyle} */}
                <TableHeaderColumn >Status</TableHeaderColumn> {/* style={tables.shortestStyle} */}
                <TableHeaderColumn >From</TableHeaderColumn> {/* style={tables.wideStyle} */}
                <TableHeaderColumn ></TableHeaderColumn> {/* style={tables.shortestStyle} */}
                <TableHeaderColumn >To</TableHeaderColumn> {/* style={tables.wideStyle} */}
            </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
            {transactions.map((tx) => <Transaction key={tx.get('hash')} tx={tx}/>)}
        </TableBody>
    </Table>;

    const titleAvatar = <Avatar icon={<FontIcon className="fa fa-dot-circle-o fa-2x" />} />;

    return (
        <div id="tx-list">
            <Card style={{...grayBackground, ...noShadow, ...cardSpace}}>
                <CardHeader
                    title="Transaction History"
                    titleStyle={styles.titleStyle}
                    avatar={titleAvatar}
                    actAsExpander={false}
                    showExpandableButton={false}
                />
                <CardText style={styles.root} expandable={false}>
                    {table}
                </CardText>
            </Card>
        </div>
    );
};

Render.propTypes = {
    transactions: PropTypes.object.isRequired,
};

const TransactionsList = connect(
    (state, ownProps) => {
        const transactionsAccounts = state.accounts.get('trackedTransactions', Immutable.List());
        const txs = ownProps.transactions || transactionsAccounts;
        return {
            transactions: txs.reverse(),
        };
    },
    (dispatch, ownProps) => ({
    })
)(Render);

export default TransactionsList;
